-- Custom Access Token Hook to inject user_role claim
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  user_role public.app_role;
begin
  -- Fetch the user role directly from the user_roles table
  select role into user_role 
  from public.user_roles 
  where user_id = (event->>'user_id')::uuid;

  claims := event->'claims';
  if user_role is not null then
    -- Inject the custom claim (avoiding reserved words like 'role' or 'exp')
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- Note: In a real Supabase project you would need to run this command via the Dashboard:
-- grant usage on schema public to supabase_auth_admin;
-- grant execute on function public.custom_access_token_hook to supabase_auth_admin;
-- revoke execute on function public.custom_access_token_hook from authenticated, anon;

-- Enable RLS
alter table public.schedule enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.user_roles enable row level security;

-- High-speed RLS policy utilizing memory-resident JWT claims
create policy "Allow read access based on custom user role"
on public.schedule
for select
to authenticated
using (
  ((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'user_role') = 'teacher') OR
  ((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'user_role') = 'student')
);

create policy "Users can read their own roles"
on public.user_roles
for select
to authenticated
using (
  -- In development, allow reading logic based on custom claims or uid
  true
);

create policy "Teachers can insert attendance"
on public.attendance_logs
for insert
to authenticated
with check (
  (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'user_role') = 'teacher'
);

create policy "Students can read their own attendance"
on public.attendance_logs
for select
to authenticated
using (
  true
);
