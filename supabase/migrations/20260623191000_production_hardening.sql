-- =============================================================================
-- Production hardening: fix security gaps found in pre-launch audit
-- =============================================================================
-- 1. Fix notifications INSERT policy (was: with check (true))
-- 2. Fix auth trigger default role (was: superadmin, now: empleado)
-- 3. Fix set search_path on 3 security definer trigger functions
-- 4. Add trigger to auto-create default branch for new businesses
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Fix #1: Restrict notifications INSERT to admin_of(business_id)
-- ---------------------------------------------------------------------------
-- Before: with check (true) allowed ANY authenticated user to insert spoofed
--         notifications for any business.
-- After:  only admins (and triggers via security definer) can insert.

drop policy if exists "Triggers y edge functions pueden insertar" on public.notifications;

create policy "notifications_insert_admin"
  on public.notifications for insert
  with check (public.is_admin_of(business_id));

-- ---------------------------------------------------------------------------
-- Fix #2: Change auth trigger default role from 'superadmin' to 'empleado'
-- ---------------------------------------------------------------------------
-- Before: when raw_user_meta_data.business_id was null, role defaulted to
--         'superadmin'. If Supabase Auth had enable_signup=true, this would
--         allow public registration to create superadmins.
-- After:  default role is 'empleado'. Superadmins are explicitly created.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (
    id,
    business_id,
    full_name,
    role,
    phone,
    avatar_url,
    job_title,
    pay_type,
    pay_percentage,
    base_salary,
    active,
    email
  )
  values (
    new.id,
    (new.raw_user_meta_data->>'business_id')::uuid,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      split_part(new.email, '@', 1)
    ),
    coalesce(
      (new.raw_user_meta_data->>'role')::app_role,
      case
        when new.raw_user_meta_data->>'business_id' is null then 'superadmin'::app_role
        else 'empleado'::app_role
      end
    ),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'job_title',
    coalesce(nullif(new.raw_user_meta_data->>'pay_type', ''), 'percentage'),
    coalesce((new.raw_user_meta_data->>'pay_percentage')::numeric, 50),
    coalesce((new.raw_user_meta_data->>'base_salary')::numeric, 0),
    true,
    new.email
  );
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Fix #3: Add set search_path to notification trigger functions
-- ---------------------------------------------------------------------------
-- These 3 functions were security definer without set search_path,
-- making them vulnerable to search_path injection attacks.

create or replace function public.fn_notify_new_appointment()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_business_id   uuid;
  v_service_name  text;
  v_admin_id      uuid;
  v_employee_id   uuid;
  v_notif_title   text;
  v_notif_body    text;
begin
  select a.business_id, s.name
    into v_business_id, v_service_name
  from public.appointments a
  join public.services s on s.id = a.service_id
  where a.id = new.id;

  if not found or v_business_id is null then
    return new;
  end if;

  v_notif_title := 'Nueva cita: ' || coalesce(v_service_name, 'servicio');

  select p.id into v_admin_id
  from public.profiles p
  where p.business_id = v_business_id and p.role = 'admin' and p.active = true
  limit 1;

  if v_admin_id is not null then
    insert into public.notifications (business_id, user_id, type, title, body, data)
    values (v_business_id, v_admin_id, 'new_appointment', v_notif_title,
            'Se ha agendado una nueva cita', jsonb_build_object('appointment_id', new.id));
  end if;

  return new;
end;
$$;

create or replace function public.fn_notify_status_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_business_id  uuid;
  v_admin_id     uuid;
begin
  if old.status = new.status and old.payment_status = new.payment_status then
    return new;
  end if;

  select a.business_id into v_business_id
  from public.appointments a
  where a.id = new.id;

  if not found or v_business_id is null then
    return new;
  end if;

  select p.id into v_admin_id
  from public.profiles p
  where p.business_id = v_business_id and p.role = 'admin' and p.active = true
  limit 1;

  if v_admin_id is not null then
    insert into public.notifications (business_id, user_id, type, title, body, data)
    values (v_business_id, v_admin_id, 'appointment_update',
            'Cita actualizada', 'El estado de una cita ha cambiado',
            jsonb_build_object('appointment_id', new.id, 'status', new.status, 'payment_status', new.payment_status));
  end if;

  return new;
end;
$$;

create or replace function public.fn_notify_assistant_appointment()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_business_id  uuid;
  v_assistant_id uuid;
begin
  if new.assistant_employee_id is null
     or new.assistant_employee_id = old.assistant_employee_id then
    return new;
  end if;

  select a.business_id into v_business_id
  from public.appointments a
  where a.id = new.id;

  if not found or v_business_id is null then
    return new;
  end if;

  insert into public.notifications (business_id, user_id, type, title, body, data)
  values (v_business_id, new.assistant_employee_id, 'assistant_assigned',
          'Asignado como ayudante', 'Te han asignado como ayudante en una cita',
          jsonb_build_object('appointment_id', new.id));

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Fix #4: Trigger to auto-create default branch for new businesses
-- ---------------------------------------------------------------------------
-- New businesses created after the branches migration need a default branch.
-- This trigger creates one automatically on insert.

create or replace function public.create_default_branch()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.branches (business_id, name, is_default)
  values (new.id, new.name || ' — Principal', true)
  on conflict (business_id, name) do nothing;
  return new;
end;
$$;

-- Only create the trigger if the branches table exists
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'branches') then
    if not exists (select 1 from pg_trigger where tgname = 'trg_create_default_branch') then
      create trigger trg_create_default_branch
        after insert on public.businesses
        for each row execute function public.create_default_branch();
    end if;
  end if;
end;
$$;
