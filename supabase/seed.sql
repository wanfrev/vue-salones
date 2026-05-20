-- =============================================================================
-- Sistema de Salones — Seed de demostración (Multi-Tenant & Inventario)
-- =============================================================================
-- Crea datos para 2 negocios: Un Salón de Belleza y un Dog Spa.
-- Incluye: Clientes con metadata, Categorías de Servicio, Variantes, 
-- Productos, Stock inicial y Locaciones.
-- =============================================================================

-- 1. BUSINESSES (Tipos de Negocio)
insert into public.businesses (id, name, slug, phone, address, timezone, currency, niche_type, theme_config, terminology)
values 
(
  'b1111111-1111-1111-1111-111111111111',
  'Salón Belleza Elegance',
  'belleza-elegance',
  '+1 809 555 1111',
  'Plaza Central',
  'America/Santo_Domingo',
  'DOP',
  'salon',
  '{"primary": "#e11d48", "secondary": "#be123c", "accent": "#f43f5e"}'::jsonb,
  '{"client": "Cliente", "employee": "Estilista", "service": "Servicio", "appointment": "Cita", "staff": "Personal"}'::jsonb
),
(
  'b2222222-2222-2222-2222-222222222222',
  'Doggy Spa & Care',
  'doggy-spa',
  '+1 809 555 2222',
  'Avenida Canina 45, Naco',
  'America/Santo_Domingo',
  'DOP',
  'dog_spa',
  '{"primary": "#059669", "secondary": "#047857", "accent": "#10b981"}'::jsonb,
  '{"client": "Mascota", "owner": "Dueño", "employee": "Groomer", "service": "Tratamiento", "appointment": "Turno", "staff": "Groomers"}'::jsonb
)
on conflict (id) do update set
  name = excluded.name,
  niche_type = excluded.niche_type,
  theme_config = excluded.theme_config,
  terminology = excluded.terminology;

-- 2. CLIENTES (Con Metadata)
insert into public.clients (id, business_id, full_name, email, phone, metadata)
values
-- Clientes Salón
('c1000000-0000-0000-0000-000000000001', 'b1111111-1111-1111-1111-111111111111', 'Ana Martínez', 'ana.m@example.com', '809-111-0001', '{"tipo_cabello": "Ondulado", "alergias": "Ninguna", "bebida_favorita": "Café"}'::jsonb),
('c1000000-0000-0000-0000-000000000002', 'b1111111-1111-1111-1111-111111111111', 'Carolina Solano', 'caro@example.com', '809-111-0002', '{"tipo_cabello": "Liso", "es_vip": true}'::jsonb),
-- Clientes Dog Spa
('c2000000-0000-0000-0000-000000000001', 'b2222222-2222-2222-2222-222222222222', 'Firulais', 'dueno_firu@example.com', '809-222-0001', '{"raza": "Golden Retriever", "peso": 25.5, "vacunas_dia": true, "dueno_nombre": "Carlos"}'::jsonb),
('c2000000-0000-0000-0000-000000000002', 'b2222222-2222-2222-2222-222222222222', 'Luna', 'luna_owner@example.com', '809-222-0002', '{"raza": "Poodle", "peso": 15.0, "agresivo": false, "dueno_nombre": "Maria"}'::jsonb)
on conflict do nothing;

-- 3. CATEGORÍAS DE SERVICIO
insert into public.service_categories (id, business_id, name, description)
values
-- Salon
('ca100000-1111-1111-1111-100000000001', 'b1111111-1111-1111-1111-111111111111', 'Cortes y Peinados', 'Servicios de styling generales'),
('ca100000-1111-1111-1111-100000000002', 'b1111111-1111-1111-1111-111111111111', 'Colorimetría', 'Tintes, mechas, balayage'),
-- Dog Spa
('ca200000-2222-2222-2222-200000000001', 'b2222222-2222-2222-2222-222222222222', 'Estética Canina (Grooming)', 'Baños y cortes caninos'),
('ca200000-2222-2222-2222-200000000002', 'b2222222-2222-2222-2222-222222222222', 'Spa Relajante', 'Masajes y aromaterapia perruna')
on conflict do nothing;

-- 4. SERVICIOS 
insert into public.services (id, business_id, service_category_id, name, description, duration_minutes, price, local_percentage, color, category)
values
-- Salon
('5e100000-1111-1111-1111-100000000001', 'b1111111-1111-1111-1111-111111111111', 'ca100000-1111-1111-1111-100000000001', 'Corte de Dama', 'Corte moderno con lavado', 45, 800, 50, '#e11d48', 'corte'),
('5e100000-1111-1111-1111-100000000002', 'b1111111-1111-1111-1111-111111111111', 'ca100000-1111-1111-1111-100000000002', 'Balayage', 'Técnica de barrido', 180, 4500, 55, '#7c3aed', 'color'),
-- Dog Spa
('5e200000-2222-2222-2222-200000000001', 'b2222222-2222-2222-2222-222222222222', 'ca200000-2222-2222-2222-200000000001', 'Baño y Corte Completo', 'Higiene general', 60, 1500, 40, '#059669', 'higiene')
on conflict do nothing;

-- 5. VARIANTES DE SERVICIO (Add-ons y tamaños)
insert into public.service_variants (id, business_id, service_id, name, price, duration_minutes)
values
-- Variantes Salon (Extras para el corte de Dama)
('5a100000-1111-1111-1111-100000000001', 'b1111111-1111-1111-1111-111111111111', '5e100000-1111-1111-1111-100000000001', 'Solo Puntas', 500, 30),
('5a100000-1111-1111-1111-100000000002', 'b1111111-1111-1111-1111-111111111111', '5e100000-1111-1111-1111-100000000001', 'Corte con Lavado y Rolos', 1200, 60),
-- Variantes Dog Spa (Tamaños para el Baño)
('5a200000-2222-2222-2222-200000000001', 'b2222222-2222-2222-2222-222222222222', '5e200000-2222-2222-2222-200000000001', 'Taza Pequeña (< 10kg)', 1200, 45),
('5a200000-2222-2222-2222-200000000002', 'b2222222-2222-2222-2222-222222222222', '5e200000-2222-2222-2222-200000000001', 'Taza Grande (> 20kg)', 2000, 90)
on conflict do nothing;

-- 6. INVENTARIO: CATEGORÍAS DE PRODUCTOS
insert into public.product_categories (id, business_id, name)
values
('cc100000-1111-1111-1111-100000000001', 'b1111111-1111-1111-1111-111111111111', 'Shampoos y Tratamientos'),
('cc200000-2222-2222-2222-200000000001', 'b2222222-2222-2222-2222-222222222222', 'Antipulgas y Accesorios')
on conflict do nothing;

-- 7. PRODUCTOS Y VARIANTES
insert into public.products (id, business_id, category_id, name, unit, unit_cost, unit_price, reorder_point)
values
('9a100000-1111-1111-1111-100000000002', 'b1111111-1111-1111-1111-111111111111', 'cc100000-1111-1111-1111-100000000001', 'Shampoo Kérastase', 'botella', 800, 1500, 5),
('9a200000-2222-2222-2222-200000000002', 'b2222222-2222-2222-2222-222222222222', 'cc200000-2222-2222-2222-200000000001', 'Collar Antipulgas NexGard', 'unidad', 1200, 2000, 10)
on conflict do nothing;

-- Variantes del Shampoo (Tamaños)
insert into public.product_variants (id, product_id, name, sku, unit_cost, unit_price)
values
('9b100000-1111-1111-1111-300000000001', '9a100000-1111-1111-1111-100000000002', '250ml', 'KER-250', 800, 1500),
('9b100000-1111-1111-1111-300000000002', '9a100000-1111-1111-1111-100000000002', '500ml', 'KER-500', 1400, 2600)
on conflict do nothing;

-- 8. LOCACIONES DE INVENTARIO Y STOCK INICIAL
insert into public.inventory_locations (id, business_id, name, is_default)
values 
('ea100000-1111-1111-1111-100000000001', 'b1111111-1111-1111-1111-111111111111', 'Vitrina Principal', true),
('ea200000-2222-2222-2222-200000000001', 'b2222222-2222-2222-2222-222222222222', 'Mostrador Tienda', true)
on conflict do nothing;

insert into public.inventory_stock (business_id, location_id, product_id, variant_id, quantity)
values
('b1111111-1111-1111-1111-111111111111', 'ea100000-1111-1111-1111-100000000001', '9a100000-1111-1111-1111-100000000002', '9b100000-1111-1111-1111-300000000001', 20),
('b1111111-1111-1111-1111-111111111111', 'ea100000-1111-1111-1111-100000000001', '9a100000-1111-1111-1111-100000000002', '9b100000-1111-1111-1111-300000000002', 10),
('b2222222-2222-2222-2222-222222222222', 'ea200000-2222-2222-2222-200000000001', '9a200000-2222-2222-2222-200000000002', null, 50)
on conflict do nothing;

-- Movimientos de Stock Inicial (Registro auditoría)
insert into public.inventory_movements (business_id, location_id, product_id, variant_id, movement_type, quantity, unit_cost, notes)
values
('b1111111-1111-1111-1111-111111111111', 'ea100000-1111-1111-1111-100000000001', '9a100000-1111-1111-1111-100000000002', '9b100000-1111-1111-1111-300000000001', 'purchase', 20, 800, 'Inventario Inicial: Shampoos Pequeños'),
('b1111111-1111-1111-1111-111111111111', 'ea100000-1111-1111-1111-100000000001', '9a100000-1111-1111-1111-100000000002', '9b100000-1111-1111-1111-300000000002', 'purchase', 10, 1400, 'Inventario Inicial: Shampoos Grandes'),
('b2222222-2222-2222-2222-222222222222', 'ea200000-2222-2222-2222-200000000001', '9a200000-2222-2222-2222-200000000002', null, 'purchase', 50, 1200, 'Compra Gran Mayorista')
on conflict do nothing;

-- =============================================================================
-- 9. USUARIOS (Auth & Profiles) - Para pruebas de multi-tenant
-- Passwords: 'password123'
-- =============================================================================

-- Necesario para generar hash:
-- create extension if not exists "pgcrypto"; (Ya está en ini_schema)

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values 
('d1000000-1111-1111-1111-100000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@salon.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
('d1000000-1111-1111-1111-100000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'maria@salon.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
('d2000000-2222-2222-2222-200000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@spa.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
('d2000000-2222-2222-2222-200000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'juan@spa.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now())
on conflict do nothing;

-- identities: omit direct inserts into auth.identities to avoid schema/constraint
-- incompatibilities across Supabase versions. Identities are created
-- automatically by Supabase auth when users sign up or via the Auth API.
-- If you need to seed identities, adapt this block to match your
-- Supabase version's `auth.identities` schema (provider_id required in some)
-- or create identities using the CLI/auth API after starting the project.

insert into public.profiles (id, business_id, full_name, role)
values
('d1000000-1111-1111-1111-100000000001', 'b1111111-1111-1111-1111-111111111111', 'Admin Salón', 'admin'),
('d1000000-1111-1111-1111-100000000002', 'b1111111-1111-1111-1111-111111111111', 'Estilista María', 'empleado'),
('d2000000-2222-2222-2222-200000000001', 'b2222222-2222-2222-2222-222222222222', 'Admin Spa', 'admin'),
('d2000000-2222-2222-2222-200000000002', 'b2222222-2222-2222-2222-222222222222', 'Groomer Juan', 'empleado')
on conflict do nothing;

insert into public.employee_services (employee_id, service_id)
values
('d1000000-1111-1111-1111-100000000002', '5e100000-1111-1111-1111-100000000001'),
('d2000000-2222-2222-2222-200000000002', '5e200000-2222-2222-2222-200000000001')
on conflict do nothing;

-- =============================================================================
-- 10. CITAS Y FINANZAS (Transacciones / Gastos)
-- =============================================================================

insert into public.appointments (id, business_id, client_id, employee_id, service_id, start_time, end_time, status, payment_status)
values
('a1000000-1111-1111-1111-100000000001', 'b1111111-1111-1111-1111-111111111111', 'c1000000-0000-0000-0000-000000000001', 'd1000000-1111-1111-1111-100000000002', '5e100000-1111-1111-1111-100000000001', now() - interval '2 days', now() - interval '2 days' + interval '45 minutes', 'completed', 'paid'),
('a1000000-1111-1111-1111-100000000002', 'b1111111-1111-1111-1111-111111111111', 'c1000000-0000-0000-0000-000000000002', 'd1000000-1111-1111-1111-100000000002', '5e100000-1111-1111-1111-100000000001', now() - interval '1 days', now() - interval '1 days' + interval '45 minutes', 'completed', 'paid'),
('a2000000-2222-2222-2222-200000000001', 'b2222222-2222-2222-2222-222222222222', 'c2000000-0000-0000-0000-000000000001', 'd2000000-2222-2222-2222-200000000002', '5e200000-2222-2222-2222-200000000001', now() - interval '1 days', now() - interval '1 days' + interval '60 minutes', 'completed', 'paid')
on conflict do nothing;

insert into public.transactions (id, business_id, appointment_id, total_amount, local_amount, employee_amount, local_percentage, employee_percentage, method, paid_at, created_by, notes, created_at)
values
-- Salón: servicio 800 con local_percentage 50 => local 400 / empleado 400
('f1000000-1111-1111-1111-100000000001', 'b1111111-1111-1111-1111-111111111111', 'a1000000-1111-1111-1111-100000000001', 800, 400, 400, 50, 50, 'card', now() - interval '2 days', 'd1000000-1111-1111-1111-100000000001', 'Pago servicio REF-001', now() - interval '2 days'),
('f1000000-1111-1111-1111-100000000002', 'b1111111-1111-1111-1111-111111111111', 'a1000000-1111-1111-1111-100000000002', 800, 400, 400, 50, 50, 'cash', now() - interval '1 days', 'd1000000-1111-1111-1111-100000000001', 'Pago servicio REF-002', now() - interval '1 days'),
-- Spa: servicio 1500 con local_percentage 40 => local 600 / empleado 900
('f2000000-2222-2222-2222-200000000001', 'b2222222-2222-2222-2222-222222222222', 'a2000000-2222-2222-2222-200000000001', 1500, 600, 900, 40, 60, 'card', now() - interval '1 days', 'd2000000-2222-2222-2222-200000000001', 'Pago servicio POS-001', now() - interval '1 days')
on conflict do nothing;

insert into public.expenses (id, business_id, name, category, amount, expense_date, notes, created_by)
values
('e1000000-1111-1111-1111-100000000001', 'b1111111-1111-1111-1111-111111111111', 'Compra de Toallas', 'supplies', 1500, current_date - 1, 'Compra para uso en servicio', 'd1000000-1111-1111-1111-100000000001'),
('e1000000-1111-1111-1111-100000000002', 'b1111111-1111-1111-1111-111111111111', 'Pago de Luz', 'utilities', 3000, current_date - 2, 'Factura mensual', 'd1000000-1111-1111-1111-100000000001'),
('e2000000-2222-2222-2222-200000000001', 'b2222222-2222-2222-2222-222222222222', 'Comida para perros', 'supplies', 2500, current_date - 1, 'Alimento para clientes', 'd2000000-2222-2222-2222-200000000001')
on conflict do nothing;
