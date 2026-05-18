# OpenCode System Instructions for Salones

This repository is a multi-tenant salon management system.

## Architecture & Boundaries
- **Frontend** (`client/`): Vue 3 SPA built with Vite, using Tailwind v4, Pinia, Vue Router, and Tanstack Query.
- **Backend** (`supabase/`): There is **no Node.js backend**. The backend relies entirely on Supabase (Postgres SQL schemas, Supabase Auth, Row Level Security, and Edge Functions).

## Local Development (Offline Mode)

### Option A — Mock Client (no Docker, datos ficticios)
- Set `VITE_USE_LOCAL_MOCK=true` in `client/.env`.
- El sistema usa un mock de Supabase sin Docker ni backend: auth, datos y consultas se simulan en memoria.
- Credenciales mock: `admin@demo.com` / `demo123` (login automático al cargar sesión).
- Datos de prueba: 1 negocio, 1 admin, 3 empleadas, 6 servicios, 8 clientes, 15 citas, horarios semanales.
- Archivos del mock: `client/src/lib/mock/mockData.ts` y `mockClient.ts`.

### Option B — Supabase local (Docker, datos reales)
1. Asegúrate de tener Docker Desktop corriendo.
2. En la raíz del proyecto: `npm install -g supabase && supabase start`.
3. Ejecuta `supabase db reset` para aplicar migraciones y cargar `supabase/seed.sql`.
4. Copia `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` de `supabase start` a `client/.env`.
5. Opcional: desactiva el mock (`VITE_USE_LOCAL_MOCK=false`).

## Database & TypeScript Codegen
- Schema changes must be written as SQL migrations in `supabase/migrations/`.
- **Crucial**: After any schema modification, you must regenerate the TypeScript types for the frontend to maintain type safety.
  - Command: `supabase gen types typescript --local > client/src/types/database.ts` (use `--linked` if working against a cloud project).

## Authorization & Multi-tenant Quirks
- **RLS is Strict**: Most tables have a `business_id`. Row Level Security ensures users only interact with their own salon's data. 
- **Profiles are Required**: A user in Supabase Auth cannot do anything until they also have an entry in `public.profiles` that links their Auth UUID to a `role` (`superadmin`, `admin`, `empleado`) and `business_id`. See `supabase/README.md` for manual insertion SQL.
- **Anonymous Booking**: Public booking features (where users have no account) rely on Postgres RPCs prefixed with `public_` (e.g., `public_get_available_slots`). These bypass certain RLS and are called directly via the Supabase JS client.
