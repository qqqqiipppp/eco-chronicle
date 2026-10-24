begin;

create table public.student_saves (
  id uuid primary key default gen_random_uuid(),
  code text unique not null check (code ~ '^EC-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$'),
  save_data jsonb not null check (jsonb_typeof(save_data) = 'object' and octet_length(save_data::text) <= 262144),
  save_version integer not null check (save_version > 0),
  revision bigint not null default 1 check (revision between 1 and 9007199254740991),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.student_saves enable row level security;
alter table public.student_saves force row level security;
revoke all on table public.student_saves from public, anon, authenticated, service_role;
grant select, insert, update on table public.student_saves to service_role;
-- Intentionally NO browser policies, NO DELETE grant, NO Realtime publication.

create function public.student_save_create(p_code text, p_save_data jsonb, p_save_version integer)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare saved public.student_saves%rowtype;
begin
  insert into public.student_saves(code, save_data, save_version)
    values (p_code, p_save_data, p_save_version) returning * into saved;
  return jsonb_build_object('ok', true, 'code', saved.code, 'revision', saved.revision,
    'saveVersion', saved.save_version, 'updatedAt', saved.updated_at);
exception when unique_violation then
  return jsonb_build_object('ok', false, 'error', 'CODE_EXISTS');
end;
$$;

create function public.student_save_load(p_code text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare saved public.student_saves%rowtype;
begin
  select * into saved from public.student_saves where code = p_code and deleted_at is null;
  if not found then return jsonb_build_object('ok', false, 'error', 'NOT_FOUND'); end if;
  return jsonb_build_object('ok', true, 'code', saved.code, 'saveData', saved.save_data,
    'saveVersion', saved.save_version, 'revision', saved.revision, 'updatedAt', saved.updated_at);
end;
$$;

create function public.student_save_update(p_code text, p_save_data jsonb, p_save_version integer, p_expected_revision bigint)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare saved public.student_saves%rowtype; current_revision bigint;
begin
  if p_expected_revision is null or p_expected_revision < 1 or p_expected_revision >= 9007199254740991 then
    return jsonb_build_object('ok', false, 'error', 'INVALID_REVISION');
  end if;
  -- Compare AND update in one statement. Never perform a read-then-unconditional-write.
  update public.student_saves set save_data = p_save_data, save_version = p_save_version,
    revision = revision + 1, updated_at = clock_timestamp()
    where code = p_code and deleted_at is null and revision = p_expected_revision returning * into saved;
  if found then
    return jsonb_build_object('ok', true, 'code', saved.code, 'revision', saved.revision,
      'saveVersion', saved.save_version, 'updatedAt', saved.updated_at);
  end if;
  select revision into current_revision from public.student_saves where code = p_code and deleted_at is null;
  if found then
    return jsonb_build_object('ok', false, 'error', 'REVISION_CONFLICT', 'serverRevision', current_revision);
  end if;
  return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
end;
$$;

revoke all on function public.student_save_create(text, jsonb, integer) from public, anon, authenticated;
revoke all on function public.student_save_load(text) from public, anon, authenticated;
revoke all on function public.student_save_update(text, jsonb, integer, bigint) from public, anon, authenticated;
grant execute on function public.student_save_create(text, jsonb, integer) to service_role;
grant execute on function public.student_save_load(text) to service_role;
grant execute on function public.student_save_update(text, jsonb, integer, bigint) to service_role;

commit;
