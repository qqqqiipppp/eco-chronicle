-- Additive rollout: legacy rows and old deployed clients remain intact. New endpoints issue six characters only.
alter table public.student_saves drop constraint student_saves_code_check;
alter table public.student_saves add constraint student_saves_code_check check (
  code ~ '^EC-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$'
  or (code ~ '^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$' and code ~ '[A-Z]' and code ~ '[2-9]')
);

create table public.student_save_rate_limits (
  scope text not null,
  subject text not null check(subject ~ '^[a-f0-9]{64}$' or subject='global'),
  bucket bigint not null,
  hits integer not null check(hits>=0),
  expires_at timestamptz not null,
  primary key(scope,subject,bucket)
);
create index student_save_rate_expiry on public.student_save_rate_limits(expires_at);
alter table public.student_save_rate_limits enable row level security;
alter table public.student_save_rate_limits force row level security;
revoke all on public.student_save_rate_limits from public,anon,authenticated,service_role;
grant select,insert,update,delete on public.student_save_rate_limits to service_role;
-- No Realtime publication. Only pseudonymous HMAC identities and counters, never codes or saves.

create function public.student_save_guarded(p_action text,p_code text,p_save_data jsonb,p_save_version integer,
  p_expected_revision bigint,p_create_request_id uuid,p_device text,p_ip text,p_code_hash text,p_trusted boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare rules jsonb:='[]'; spent jsonb:='[]'; rule jsonb; item jsonb; result jsonb;
  seconds bigint:=floor(extract(epoch from clock_timestamp())); v_bucket bigint; taken integer; period integer;
begin
  if p_action not in ('create','load','save') or p_device !~ '^[a-f0-9]{64}$' or p_ip !~ '^[a-f0-9]{64}$'
    or p_code_hash !~ '^[a-f0-9]{64}$' or p_code !~ '^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$'
    or p_code !~ '[A-Z]' or p_code !~ '[2-9]' then
    return jsonb_build_object('ok',false,'error','INVALID_REQUEST');
  end if;
  if p_action='create' then
    rules:=jsonb_build_array(
      jsonb_build_object('s','create-device-minute','id',p_device,'p',60,'n',5),
      jsonb_build_object('s','create-device-hour','id',p_device,'p',3600,'n',20),
      jsonb_build_object('s','create-ip-hour','id',p_ip,'p',3600,'n',300),
      jsonb_build_object('s','create-ip-day','id',p_ip,'p',86400,'n',1000),
      jsonb_build_object('s','create-global-hour','id','global','p',3600,'n',600),
      jsonb_build_object('s','create-global-day','id','global','p',86400,'n',3000));
  elsif not coalesce(p_trusted,false) then
    rules:=jsonb_build_array(
      jsonb_build_object('s','probe-device','id',p_device,'p',60,'n',12),
      jsonb_build_object('s','probe-code','id',p_code_hash,'p',60,'n',12),
      jsonb_build_object('s','probe-ip','id',p_ip,'p',60,'n',300),
      jsonb_build_object('s','probe-global','id','global','p',60,'n',600),
      jsonb_build_object('s','fail-device-short','id',p_device,'p',600,'n',8,'refund',true),
      jsonb_build_object('s','fail-device-day','id',p_device,'p',86400,'n',30,'refund',true),
      jsonb_build_object('s','fail-code','id',p_code_hash,'p',3600,'n',20,'refund',true),
      jsonb_build_object('s','fail-ip-hour','id',p_ip,'p',3600,'n',200,'refund',true),
      jsonb_build_object('s','fail-ip-day','id',p_ip,'p',86400,'n',600,'refund',true),
      jsonb_build_object('s','fail-global-hour','id','global','p',3600,'n',600,'refund',true),
      jsonb_build_object('s','fail-global-day','id','global','p',86400,'n',2000,'refund',true));
  end if;
  -- Verified resume proofs skip guessing budgets, never the general abuse ceilings.
  rules:=rules||jsonb_build_array(
    jsonb_build_object('s','request-device','id',p_device,'p',60,'n',120),
    jsonb_build_object('s','request-ip','id',p_ip,'p',60,'n',3000));
  for rule in select value from jsonb_array_elements(rules) loop
    period:=(rule->>'p')::integer; v_bucket:=(seconds/period)*period; taken:=null;
    insert into public.student_save_rate_limits as counter(scope,subject,bucket,hits,expires_at)
      values(rule->>'s',rule->>'id',v_bucket,1,to_timestamp(v_bucket+period))
      on conflict(scope,subject,bucket) do update set hits=counter.hits+1 where counter.hits<(rule->>'n')::integer
      returning hits into taken;
    if taken is null then
      -- A denied request must not consume unrelated classroom-wide budgets.
      for item in select value from jsonb_array_elements(spent) loop
        update public.student_save_rate_limits set hits=greatest(0,hits-1)
          where scope=item->>'s' and subject=item->>'id' and student_save_rate_limits.bucket=(item->>'b')::bigint;
      end loop;
      return jsonb_build_object('ok',false,'error','RATE_LIMITED','retryAfter',greatest(1,v_bucket+period-seconds));
    end if;
    spent:=spent||jsonb_build_array(rule||jsonb_build_object('b',v_bucket));
  end loop;
  if p_action='create' then
    if p_create_request_id is not null then
      result:=public.student_save_create_once(p_code,p_save_data,p_save_version,p_create_request_id);
    else result:=public.student_save_create(p_code,p_save_data,p_save_version); end if;
  elsif p_action='load' then result:=public.student_save_load(p_code);
  else result:=public.student_save_update(p_code,p_save_data,p_save_version,p_expected_revision); end if;
  for item in select value from jsonb_array_elements(spent) loop
    if result->>'error'='CODE_EXISTS' or ((item->>'refund')::boolean and result->>'error' is distinct from 'NOT_FOUND') then
      update public.student_save_rate_limits set hits=greatest(0,hits-1)
        where scope=item->>'s' and subject=item->>'id' and student_save_rate_limits.bucket=(item->>'b')::bigint;
    end if;
  end loop;
  -- Bounded opportunistic expiry cleanup; no student record is deleted.
  if random()<0.02 then
    delete from public.student_save_rate_limits where (scope,subject,bucket) in
      (select scope,subject,bucket from public.student_save_rate_limits where expires_at<clock_timestamp() limit 500);
  end if;
  return result;
end;
$$;
revoke all on function public.student_save_guarded(text,text,jsonb,integer,bigint,uuid,text,text,text,boolean) from public,anon,authenticated;
grant execute on function public.student_save_guarded(text,text,jsonb,integer,bigint,uuid,text,text,text,boolean) to service_role;

-- Existing Auth/allowlist/audit behavior; mask four of six characters.
create or replace function public.student_admin_list(p_admin uuid,p_query text default '',p_sort text default 'updated',p_filter text default 'active',p_limit integer default 25,p_offset integer default 0)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare items jsonb; more boolean;
begin
  if not public.student_admin_allowed(p_admin) then return jsonb_build_object('ok',false,'error','ADMIN_FORBIDDEN'); end if;
  if p_query is null or char_length(p_query)>64 or p_sort not in ('updated','name','level','tower','created') or p_filter not in ('active','deleted','all') or p_limit not between 1 and 50 or p_offset not between 0 and 1000000 then
    return jsonb_build_object('ok',false,'error','INVALID_REQUEST');
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'maskedCode',case when length(r.code)=6 then left(r.code,2)||'****' else '이전 코드' end,
    'name',r.save_data->'name','localCode',r.save_data->'code','level',r.save_data->'lv','exp',r.save_data->'exp',
    'theme',r.save_data->'themeId','gauge',r.save_data->'gauge','towerFloor',r.save_data#>'{tower,best}',
    'towerTime',r.save_data#>'{tower,bestTime}','saveVersion',r.save_version,'revision',r.revision,
    'createdAt',r.created_at,'updatedAt',r.updated_at,'deletedAt',r.deleted_at)),'[]') into items
  from (select * from public.student_saves s where
    (p_filter='all' or (p_filter='active' and s.deleted_at is null) or (p_filter='deleted' and s.deleted_at is not null)) and
    (p_query='' or strpos(lower(coalesce(s.save_data->>'name','')),lower(p_query))>0 or
      strpos(upper(replace(s.code,'-','')),upper(replace(p_query,'-','')))>0 or
      strpos(upper(coalesce(s.save_data->>'code','')),upper(p_query))>0)
    order by
      case when p_sort='updated' then s.updated_at end desc,
      case when p_sort='name' then s.save_data->>'name' end asc,
      case when p_sort='level' and jsonb_typeof(s.save_data->'lv')='number' then (s.save_data->>'lv')::numeric end desc nulls last,
      case when p_sort='tower' and jsonb_typeof(s.save_data#>'{tower,best}')='number' then (s.save_data#>>'{tower,best}')::numeric end desc nulls last,
      case when p_sort='created' then s.created_at end desc,s.id
    limit p_limit+1 offset p_offset) r;
  more:=jsonb_array_length(items)>p_limit;
  if more then items:=items-p_limit; end if;
  return jsonb_build_object('ok',true,'items',items,'hasMore',more,'offset',p_offset,'limit',p_limit);
end;
$$;

create or replace function public.student_admin_get(p_admin uuid,p_id uuid,p_reveal boolean default false,p_export boolean default false)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare r public.student_saves%rowtype;
begin
  if not public.student_admin_allowed(p_admin) then return jsonb_build_object('ok',false,'error','ADMIN_FORBIDDEN'); end if;
  select * into r from public.student_saves where id=p_id;
  if not found then return jsonb_build_object('ok',false,'error','NOT_FOUND'); end if;
  if p_export or p_reveal then
    insert into public.student_admin_audit(admin_user_id,student_save_id,action)
      values(p_admin,r.id,case when p_export then 'EXPORT' else 'VIEW_CODE' end);
  end if;
  return jsonb_build_object('ok',true,'student',jsonb_build_object('id',r.id,
    'maskedCode',case when length(r.code)=6 then left(r.code,2)||'****' else '이전 코드' end,'code',case when p_export or p_reveal then r.code else null end,
    'saveData',r.save_data,'saveVersion',r.save_version,'revision',r.revision,
    'createdAt',r.created_at,'updatedAt',r.updated_at,'deletedAt',r.deleted_at));
end;
$$;

