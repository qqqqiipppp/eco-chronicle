begin;
create table public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  display_name text check (char_length(display_name)<=80),
  disabled_at timestamptz
);
create table public.student_save_admin_backups (
  id uuid primary key default gen_random_uuid(),
  student_save_id uuid not null references public.student_saves(id),
  revision bigint not null,
  cloud_code text not null,
  save_data jsonb not null,
  save_version integer not null,
  reason text not null check(reason in ('UPDATE','SOFT_DELETE','RESTORE','ROTATE_CODE')),
  admin_user_id uuid not null,
  created_at timestamptz not null default clock_timestamp()
);
create index student_admin_backup_recent on public.student_save_admin_backups(student_save_id,created_at desc,id);
create table public.student_admin_audit (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null,
  student_save_id uuid not null references public.student_saves(id),
  action text not null check(action in ('CREATE','UPDATE','SOFT_DELETE','RESTORE','ROTATE_CODE','EXPORT','VIEW_CODE')),
  created_at timestamptz not null default clock_timestamp(),
  metadata jsonb not null default '{}' check(jsonb_typeof(metadata)='object' and octet_length(metadata::text)<=4096)
);
create index student_admin_audit_student on public.student_admin_audit(student_save_id,action,created_at desc);
create index student_admin_recent on public.student_saves(updated_at desc,id);

alter table public.app_admins enable row level security;
alter table public.app_admins force row level security;
alter table public.student_save_admin_backups enable row level security;
alter table public.student_save_admin_backups force row level security;
alter table public.student_admin_audit enable row level security;
alter table public.student_admin_audit force row level security;
revoke all on public.app_admins,public.student_save_admin_backups,public.student_admin_audit from public,anon,authenticated,service_role;
grant select on public.app_admins to service_role;
grant select,insert,delete on public.student_save_admin_backups to service_role;
grant select,insert on public.student_admin_audit to service_role;
-- No DELETE on student_saves. No browser policies or Realtime publication.

create function public.student_admin_allowed(p_admin uuid) returns boolean
language sql stable security invoker set search_path='' as $$
  select exists(select 1 from public.app_admins where user_id=p_admin and disabled_at is null);
$$;

create function public.student_admin_list(p_admin uuid,p_query text default '',p_sort text default 'updated',p_filter text default 'active',p_limit integer default 25,p_offset integer default 0)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare items jsonb; more boolean;
begin
  if not public.student_admin_allowed(p_admin) then return jsonb_build_object('ok',false,'error','ADMIN_FORBIDDEN'); end if;
  if p_query is null or char_length(p_query)>64 or p_sort not in ('updated','name','level','tower','created') or p_filter not in ('active','deleted','all') or p_limit not between 1 and 50 or p_offset not between 0 and 1000000 then
    return jsonb_build_object('ok',false,'error','INVALID_REQUEST');
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'maskedCode',left(r.code,5)||'**-****',
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

create function public.student_admin_get(p_admin uuid,p_id uuid,p_reveal boolean default false,p_export boolean default false)
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
    'maskedCode',left(r.code,5)||'**-****','code',case when p_export or p_reveal then r.code else null end,
    'saveData',r.save_data,'saveVersion',r.save_version,'revision',r.revision,
    'createdAt',r.created_at,'updatedAt',r.updated_at,'deletedAt',r.deleted_at));
end;
$$;

create function public.student_admin_mutate(p_admin uuid,p_action text,p_id uuid default null,p_expected_revision bigint default null,
  p_save_data jsonb default null,p_save_version integer default null,p_new_code text default null,p_changed_fields jsonb default '[]',p_request_id uuid default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare r public.student_saves%rowtype; result public.student_saves%rowtype;
begin
  -- Check again inside the transactional RPC; browser identities never call it.
  perform 1 from public.app_admins where user_id=p_admin and disabled_at is null;
  if not found then return jsonb_build_object('ok',false,'error','ADMIN_FORBIDDEN'); end if;
  if p_action not in ('CREATE','UPDATE','SOFT_DELETE','RESTORE','ROTATE_CODE') then
    return jsonb_build_object('ok',false,'error','INVALID_REQUEST'); end if;
  if p_action='CREATE' then
    if p_request_id is null then return jsonb_build_object('ok',false,'error','INVALID_REQUEST'); end if;
    perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
    select * into result from public.student_saves where create_request_id=p_request_id;
    if found then
      if result.deleted_at is not null then return jsonb_build_object('ok',false,'error','NOT_FOUND'); end if;
      return jsonb_build_object('ok',true,'id',result.id,'revision',result.revision,'saveVersion',result.save_version,'updatedAt',result.updated_at,'code',result.code);
    end if;
    insert into public.student_saves(code,save_data,save_version,create_request_id) values(p_new_code,p_save_data,p_save_version,p_request_id) returning * into result;
  else
    if p_expected_revision is null or p_expected_revision<1 or p_expected_revision>=9007199254740991 then
      return jsonb_build_object('ok',false,'error','INVALID_REVISION'); end if;
    select * into r from public.student_saves where id=p_id for update;
    if not found then return jsonb_build_object('ok',false,'error','NOT_FOUND'); end if;
    if r.revision<>p_expected_revision then
      return jsonb_build_object('ok',false,'error','ADMIN_REVISION_CONFLICT','serverRevision',r.revision); end if;
    if (p_action in ('UPDATE','SOFT_DELETE','ROTATE_CODE') and r.deleted_at is not null) or (p_action='RESTORE' and r.deleted_at is null) then
      return jsonb_build_object('ok',false,'error','INVALID_STUDENT_STATE'); end if;
    if p_action='ROTATE_CODE' and (p_new_code is null or p_new_code=r.code) then return jsonb_build_object('ok',false,'error','CODE_EXISTS'); end if;
    insert into public.student_save_admin_backups(student_save_id,revision,cloud_code,save_data,save_version,reason,admin_user_id)
      values(r.id,r.revision,r.code,r.save_data,r.save_version,p_action,p_admin);
    update public.student_saves set
      save_data=case when p_action='UPDATE' then p_save_data else save_data end,
      save_version=case when p_action='UPDATE' then p_save_version else save_version end,
      code=case when p_action='ROTATE_CODE' then p_new_code else code end,
      deleted_at=case when p_action='SOFT_DELETE' then clock_timestamp() when p_action='RESTORE' then null else deleted_at end,
      revision=revision+1,updated_at=clock_timestamp()
      where id=p_id and revision=p_expected_revision returning * into result;
    if not found then raise exception 'CAS changed inside locked mutation'; end if;
    delete from public.student_save_admin_backups b where b.student_save_id=p_id and b.id not in
      (select id from public.student_save_admin_backups where student_save_id=p_id order by created_at desc,id limit 10);
  end if;
  insert into public.student_admin_audit(admin_user_id,student_save_id,action,metadata)
    values(p_admin,result.id,p_action,jsonb_build_object('changedFields',p_changed_fields));
  return jsonb_build_object('ok',true,'id',result.id,'revision',result.revision,'saveVersion',result.save_version,
    'updatedAt',result.updated_at,'code',case when p_action in ('CREATE','ROTATE_CODE') then result.code else null end);
exception when unique_violation then
  -- The entire block (including backup/audit) is rolled back on a code collision.
  return jsonb_build_object('ok',false,'error','CODE_EXISTS');
end;
$$;

-- A retired code must not be revealed again through its old idempotent receipt.
-- Retain the request UUID UNIQUE so replay cannot create a duplicate student either.
create or replace function public.student_save_create_once(p_code text,p_save_data jsonb,p_save_version integer,p_create_request_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare saved public.student_saves%rowtype;
begin
  if p_create_request_id is null then return jsonb_build_object('ok',false,'error','INVALID_REQUEST'); end if;
  perform pg_advisory_xact_lock(hashtextextended(p_create_request_id::text,0));
  select * into saved from public.student_saves where create_request_id=p_create_request_id;
  if found then
    if saved.deleted_at is not null or exists(select 1 from public.student_admin_audit where student_save_id=saved.id and action='ROTATE_CODE') then
      return jsonb_build_object('ok',false,'error','NOT_FOUND'); end if;
  else
    begin
      insert into public.student_saves(code,save_data,save_version,create_request_id)
        values(p_code,p_save_data,p_save_version,p_create_request_id) returning * into saved;
    exception when unique_violation then return jsonb_build_object('ok',false,'error','CODE_EXISTS'); end;
  end if;
  return jsonb_build_object('ok',true,'code',saved.code,'revision',saved.revision,'saveVersion',saved.save_version,'updatedAt',saved.updated_at);
end;
$$;

revoke all on function public.student_admin_allowed(uuid) from public,anon,authenticated;
revoke all on function public.student_admin_list(uuid,text,text,text,integer,integer) from public,anon,authenticated;
revoke all on function public.student_admin_get(uuid,uuid,boolean,boolean) from public,anon,authenticated;
revoke all on function public.student_admin_mutate(uuid,text,uuid,bigint,jsonb,integer,text,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.student_admin_allowed(uuid) to service_role;
grant execute on function public.student_admin_list(uuid,text,text,text,integer,integer) to service_role;
grant execute on function public.student_admin_get(uuid,uuid,boolean,boolean) to service_role;
grant execute on function public.student_admin_mutate(uuid,text,uuid,bigint,jsonb,integer,text,jsonb,uuid) to service_role;
commit;
