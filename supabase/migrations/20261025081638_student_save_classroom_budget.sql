-- More room for a class sharing Wi-Fi; device/code/global guessing limits stay unchanged.
-- Replace only the reviewed function body fragments, keeping signature, grants and invoker rights.
do $$
declare definition text; before_cleanup text; after_cleanup text;
begin
  select pg_get_functiondef('public.student_save_guarded(text,text,jsonb,integer,bigint,uuid,text,text,text,boolean)'::regprocedure) into definition;
  if strpos(definition,'''fail-ip-hour'',''id'',p_ip,''p'',3600,''n'',200')=0 then
    raise exception 'Unexpected guard definition; inspect before applying';
  end if;
  definition:=replace(definition,'''fail-ip-hour'',''id'',p_ip,''p'',3600,''n'',200','''fail-ip-hour'',''id'',p_ip,''p'',3600,''n'',600');
  definition:=replace(definition,'''fail-ip-day'',''id'',p_ip,''p'',86400,''n'',600','''fail-ip-day'',''id'',p_ip,''p'',86400,''n'',1200');
  before_cleanup:=$old$delete from public.student_save_rate_limits where (scope,subject,bucket) in
      (select scope,subject,bucket from public.student_save_rate_limits where expires_at<clock_timestamp() limit 500);$old$;
  after_cleanup:=$new$with expired as (
      select ctid from public.student_save_rate_limits where expires_at<clock_timestamp()
        order by expires_at limit 500 for update skip locked
    ) delete from public.student_save_rate_limits r using expired e where r.ctid=e.ctid;$new$;
  if strpos(definition,before_cleanup)=0 then raise exception 'Unexpected expiry cleanup'; end if;
  execute replace(definition,before_cleanup,after_cleanup);
end;
$$;
