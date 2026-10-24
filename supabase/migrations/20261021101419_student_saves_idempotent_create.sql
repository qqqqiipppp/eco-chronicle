begin;

-- Additive only: existing codes, JSON, revisions and permissions are unchanged.
alter table public.student_saves add column create_request_id uuid unique;

create function public.student_save_create_once(p_code text, p_save_data jsonb, p_save_version integer, p_create_request_id uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare saved public.student_saves%rowtype;
begin
  if p_create_request_id is null then
    return jsonb_build_object('ok',false,'error','INVALID_REQUEST');
  end if;
  -- Serializes concurrent retries of the SAME random request, not all students.
  perform pg_advisory_xact_lock(hashtextextended(p_create_request_id::text,0));
  select * into saved from public.student_saves where create_request_id=p_create_request_id;
  if found then
    if saved.deleted_at is not null then return jsonb_build_object('ok',false,'error','NOT_FOUND'); end if;
  else
    begin
      insert into public.student_saves(code,save_data,save_version,create_request_id)
        values(p_code,p_save_data,p_save_version,p_create_request_id) returning * into saved;
    exception when unique_violation then
      return jsonb_build_object('ok',false,'error','CODE_EXISTS');
    end;
  end if;
  return jsonb_build_object('ok',true,'code',saved.code,'revision',saved.revision,
    'saveVersion',saved.save_version,'updatedAt',saved.updated_at);
end;
$$;
revoke all on function public.student_save_create_once(text,jsonb,integer,uuid) from public,anon,authenticated;
grant execute on function public.student_save_create_once(text,jsonb,integer,uuid) to service_role;
commit;
