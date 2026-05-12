-- =============================================================================
-- Sistema de Salones — Seed de demostración
-- =============================================================================
-- Crea un salón demo con servicios típicos. No crea usuarios (auth.users debe
-- crearse vía Supabase Auth; ver supabase/README.md para crear admin).
-- Idempotente: usa ON CONFLICT para poder re-ejecutarse.
-- =============================================================================

insert into public.businesses (id, name, slug, phone, address, timezone, currency, primary_color)
values (
  '00000000-0000-0000-0000-000000000001',
  'Salón Demo',
  'demo',
  '+1 809 555 0100',
  'Calle Principal #123, Santo Domingo',
  'America/Santo_Domingo',
  'DOP',
  '#2F4156'
)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug;

-- Servicios típicos de salón.
insert into public.services (business_id, name, description, duration_minutes, price, local_percentage, color)
values
  ('00000000-0000-0000-0000-000000000001', 'Corte de cabello',  'Corte y peinado básico',          45,  600.00, 50, '#567CB0'),
  ('00000000-0000-0000-0000-000000000001', 'Tinte',             'Aplicación de color completo',   120, 2500.00, 60, '#2F4156'),
  ('00000000-0000-0000-0000-000000000001', 'Manicure',          'Manicure clásica',                45,  450.00, 40, '#C9D9E6'),
  ('00000000-0000-0000-0000-000000000001', 'Pedicure',          'Pedicure spa',                    60,  650.00, 40, '#567CB0'),
  ('00000000-0000-0000-0000-000000000001', 'Lavado y peinado',  'Lavado + peinado para evento',    60,  900.00, 50, '#2F4156'),
  ('00000000-0000-0000-0000-000000000001', 'Maquillaje',        'Maquillaje social',               60, 1800.00, 55, '#567CB0')
on conflict do nothing;
