# Salones — Resumen del Proyecto

## Conexión

- **Supabase Cloud:** `https://ppnbiztmehjvtjijqdwa.supabase.co`
- **Frontend:** Vue 3 SPA → apunta a Supabase vía `client/.env`
- **Mock desactivado** (`VITE_USE_LOCAL_MOCK` comentado en `.env`)

## Seed ejecutado (`supabase/seed.sql`)

Datos cargados en el SQL Editor de Supabase:

### Negocios

1. **Salón Elegancia** — estética femenina
2. **Barber King** — barbería masculina

### Datos de prueba

- 15 servicios, 3 variantes, 8 categorías
- 15 clientes, 21 citas (pasadas + próximas)
- 10 transacciones, 9 gastos, 2 ausencias
- 17 productos, 6 variantes, 4 locaciones, stock y movimientos

## Cómo agregar un nuevo superadmin a este proyecto

### 1. Crear el usuario desde el Dashboard

1. Ir a **Authentication → Users → Add User**
2. Email: el que quieras (ej. `superadmin@tudominio.com`)
3. Password: una segura (ej. `SuperAdmin123`)
4. ✅ Auto Confirm User
5. Click en **Create user**

El trigger que ya está desplegado en este proyecto detecta que no hay `business_id` en metadata y asigna `role = 'superadmin'` automáticamente, así que el usuario puede hacer login de inmediato.

### 2. Hacer login

Entrar a la app con el email y contraseña del paso anterior.

## Flujo: crear negocios y usuarios desde la app

Una vez dentro como superadmin:

### Superadmin → crea un negocio con su admin

1. En el panel Superadmin, llenar: nombre del negocio, email del dueño, contraseña del dueño, nicho
2. La Edge Function `superadmin-invite` crea:
   - El negocio en `public.businesses`
   - El usuario en `auth.users` con email + password
   - El trigger crea el profile con `role = 'admin'` y `business_id` asignado
3. El admin ya puede hacer login inmediatamente

### Admin → crea empleados

1. El admin entra a la app y va a **Equipo → Nuevo Empleado**
2. Llena: nombre, email, **contraseña**, teléfono, horario, tipo de pago
3. La Edge Function `manage-user` crea:
   - El usuario en `auth.users` con email + password
   - El trigger crea el profile con `role = 'empleado'` y `business_id` asignado
   - Además se insertan los horarios (`employee_schedules`)
4. El empleado ya puede hacer login con su email y contraseña

### Resumen del flujo automático

```
Superadmin [UI] → crea negocio + admin
    → superadmin-invite (Edge Function)
        → auth.admin.createUser() + user_metadata
            → TRIGGER crea profile automáticamente
                → Admin puede login

Admin [UI] → crea empleado
    → manage-user (Edge Function)
        → auth.admin.createUser() + user_metadata
            → TRIGGER crea profile automáticamente
                → Empleado puede login
```

Nunca más hay que tocar la BD manualmente para crear usuarios.

## Edge Functions

| Función | Ruta | Descripción |
|---------|------|-------------|
| `superadmin-invite` | `supabase/functions/superadmin-invite/` | Crea negocio + usuario admin |
| `manage-user` | `supabase/functions/manage-user/` | CRUD de usuarios Auth (create/update/delete) |

Para desplegar cambios:
```bash
supabase functions deploy manage-user
supabase functions deploy superadmin-invite
```

## Comandos útiles

- **Mock local:** descomentar `VITE_USE_LOCAL_MOCK=true` en `client/.env` → usar `admin@demo.com` / `demo123`
- **Regenerar types:** `supabase gen types typescript --linked > client/src/types/database.ts`
- **Nueva migración:** crear archivo en `supabase/migrations/` con formato `YYYYMMDDHHmmss_descripcion.sql`
- **Limpiar usuarios de prueba:** ejecutar `supabase/scripts/cleanup_users.sql` en el SQL Editor
