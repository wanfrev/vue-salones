# Recordatorios In-App con WhatsApp — Plan de Implementación

## Objetivo

24 horas antes de una cita, el sistema muestra una **notificación in-app** al empleado asignado y al admin del negocio preguntando si quieren recordarle al cliente por WhatsApp. Al hacer clic en "Sí", se abre el chat de WhatsApp con el cliente.

Sin APIs externas, sin Meta Cloud, sin webhooks.

---

## Flujo Completo

```
Cada hora (GitHub Actions)
  ↓
Edge Function `generate-reminders`
  ↓
Busca citas en ~24h con reminder_sent_at = NULL
  ↓
Inserta filas en reminder_notifications:
  • 1 por empleado asignado
  • 1 por cada admin del negocio
  ↓
UPDATE appointments SET reminder_sent_at = now()
  ↓
Frontend (TanStack Query polling cada 30s)
  ↓
Campanita 🔔 con badge de conteo en el header
  ↓ Click
Dropdown con lista de recordatorios pendientes
  ↓ Click "Recordar por WhatsApp"
window.open(`https://wa.me/{phone}`) + marca como enviado en DB
```

---

## Archivos a Crear / Modificar

| Archivo | Acción | Líneas est. |
|---|---|---|
| `supabase/migrations/XXXXXXX_reminder_notifications.sql` | Nuevo | 35 |
| `supabase/functions/generate-reminders/index.ts` | Nuevo | 60 |
| `.github/workflows/send-reminders.yml` | Nuevo | 20 |
| `client/src/services/reminderService.ts` | Nuevo | 50 |
| `client/src/composables/useReminders.ts` | Nuevo | 70 |
| `client/src/components/common/NotificationBell.vue` | Nuevo | 50 |
| `client/src/components/common/NotificationDropdown.vue` | Nuevo | 80 |
| `client/src/components/layout/AdminLayout.vue` | Modificar | +2 |
| `client/src/components/layout/AppLayout.vue` | Modificar | +2 |

**Total: 6 archivos nuevos, 2 modificados, ~350 líneas.**

---

## 1. Base de Datos — Migración

### Tabla `reminder_notifications`

```sql
create table public.reminder_notifications (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null references public.businesses(id) on delete cascade,
  appointment_id   uuid not null references public.appointments(id) on delete cascade,
  profile_id       uuid not null references public.profiles(id) on delete cascade,
  client_name      text not null,
  client_phone     text not null,
  service_name     text not null,
  appointment_time timestamptz not null,
  was_sent         boolean not null default false,
  dismissed_at     timestamptz,
  created_at       timestamptz not null default now()
);
```

### Índices

```sql
-- Consultas rápidas por perfil + estado
create index idx_reminders_pending
  on public.reminder_notifications(profile_id, was_sent, dismissed_at)
  where was_sent = false and dismissed_at is null;

-- Consulta para generar recordatorios (Edge Function)
create index idx_reminders_appointment
  on public.reminder_notifications(appointment_id);
```

### Row Level Security

```sql
alter table public.reminder_notifications enable row level security;

create policy "Usuarios ven solo sus propios recordatorios"
  on public.reminder_notifications for select
  using (profile_id = auth.uid());

create policy "Usuarios actualizan solo sus propios recordatorios"
  on public.reminder_notifications for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "Edge function puede insertar libremente"
  on public.reminder_notifications for insert
  with check (true);
```

---

## 2. Edge Function — `generate-reminders`

`supabase/functions/generate-reminders/index.ts`

- Recibe un `CRON_SECRET` en el header `Authorization` para autenticación
- Consulta:
  - `appointments` donde `start_time BETWEEN now()+23h AND now()+25h`
  - `reminder_sent_at IS NULL`
  - `status = 'pending'`
- Por cada cita:
  - Obtiene `client_name`, `client_phone` de `clients`
  - Obtiene `service_name` de `services`
  - Inserta `reminder_notification` para `employee_id`
  - Inserta `reminder_notification` para cada `profile` con `role = 'admin'` en ese `business_id`
  - Marca `reminder_sent_at = now()`
- Retorna `{ generated: N }`

**Variables de entorno (Supabase Secrets):**

| Variable | Valor |
|---|---|
| `CRON_SECRET` | Clave secreta compartida con GitHub Actions |

---

## 3. Scheduling — GitHub Actions

`.github/workflows/send-reminders.yml`

```yaml
name: Generate WhatsApp Reminders
on:
  schedule:
    - cron: '0 * * * *'   # cada hora en punto
  workflow_dispatch:       # permitir ejecución manual

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Call generate-reminders edge function
        run: |
          curl -X POST https://ppnbiztmehjvtjijqdwa.supabase.co/functions/v1/generate-reminders \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

> El `CRON_SECRET` se configura como **GitHub Secret** y como **Supabase Edge Function Secret**.

---

## 4. Servicio — `reminderService.ts`

`client/src/services/reminderService.ts`

### Query Key Factory

```ts
export const reminderKeys = {
  pending: (profileId?: string | null) => ['reminders', profileId] as const,
}
```

### Funciones

| Función | Descripción |
|---|---|
| `listPendingReminders(profileId)` | `SELECT ... WHERE profile_id = $1 AND was_sent = false AND dismissed_at IS NULL ORDER BY appointment_time` |
| `markReminderAsSent(id)` | `UPDATE reminder_notifications SET was_sent = true WHERE id = $1` |
| `dismissReminder(id)` | `UPDATE reminder_notifications SET dismissed_at = now() WHERE id = $1` |

### Patrón

- **Reads**: `supabase` de `lib/supabase.ts` (cliente tipado)
- **Writes**: `mutate` de `lib/typedSupabase.ts`

---

## 5. Composable — `useReminders.ts`

`client/src/composables/useReminders.ts`

### Estado y queries

```ts
const authStore = useAuthStore()
const profileId = computed(() => authStore.profile?.id ?? null)

const { data: pendingReminders = [], isLoading } = useQuery({
  queryKey: reminderKeys.pending(profileId),
  queryFn: () => listPendingReminders(profileId.value!),
  enabled: !!profileId.value,
  refetchInterval: 30_000,   // polling cada 30s
})

const unreadCount = computed(() => pendingReminders.value.length)
```

### Mutaciones

```ts
const sendMutation = useMutation({ mutationFn: markReminderAsSent })
const dismissMutation = useMutation({ mutationFn: dismissReminder })

function handleSendWhatsApp(notification: ReminderNotification) {
  sendMutation.mutate(notification.id, {
    onSuccess: () => {
      const phone = sanitizePhone(notification.clientPhone)
      if (phone) window.open(`https://wa.me/${phone}`, '_blank')
    }
  })
}

function handleDismiss(id: string) {
  dismissMutation.mutate(id)
}
```

### Exposición

```ts
return {
  pendingReminders,
  unreadCount,
  isLoading,
  handleSendWhatsApp,
  handleDismiss,
}
```

---

## 6. Componentes UI

### `NotificationBell.vue`

- Ícono `Bell` de `lucide-vue-next`
- Badge rojo con `unreadCount` (oculto si 0)
- Al hacer clic, abre/cierra `NotificationDropdown`

### `NotificationDropdown.vue`

```
┌──────────────────────────────────┐
│ 🔔 Recordatorios pendientes  (3) │
├──────────────────────────────────┤
│ 🕐 María González                 │
│    Corte de cabello               │
│    Mañana 10:30 AM                │
│    [📱 Recordar WhatsApp]  [✕]   │
├──────────────────────────────────┤
│ 🕐 Carlos Ruiz                    │
│    Tinte + Peinado                │
│    Mañana 14:00                   │
│    [📱 Recordar WhatsApp]  [✕]   │
├──────────────────────────────────┤
│ 🕐 Ana Martínez                   │
│    Manicure                       │
│    Mañana 16:30                   │
│    [📱 Recordar WhatsApp]  [✕]   │
└──────────────────────────────────┘
```

- Estado vacío: "No hay recordatorios pendientes ✅"
- Cada item: nombre del cliente, servicio, hora, dos botones
- "Recordar WhatsApp": llama a `handleSendWhatsApp`, abre `wa.me`
- "✕": llama a `handleDismiss`

---

## 7. Integración en Layouts

### `AdminLayout.vue`

Agregar `<NotificationBell />` en el header, junto al usuario/avatar.

### `AppLayout.vue`

Agregar `<NotificationBell />` en el header del empleado.

---

## Variables de Entorno

### Supabase Edge Function Secrets

| Secret | Propósito |
|---|---|
| `CRON_SECRET` | Autenticar llamadas desde GitHub Actions |

### GitHub Secrets

| Secret | Propósito |
|---|---|
| `CRON_SECRET` | Token para llamar a la Edge Function |

---

## Dependencias

Ya están en el proyecto. No se instala nada nuevo.

| Paquete | Uso |
|---|---|
| `lucide-vue-next` | Ícono Bell para la campana |
| `@supabase/supabase-js` | Cliente de base de datos |
| `@tanstack/vue-query` | Polling + mutations de recordatorios |
| `zod` | Validación (opcional, en el servicio) |

---

## Orden de Implementación

1. Migración SQL (`reminder_notifications`)
2. Edge Function (`generate-reminders`)
3. GitHub Actions workflow
4. Servicio (`reminderService.ts`)
5. Composable (`useReminders.ts`)
6. Componentes (`NotificationBell.vue`, `NotificationDropdown.vue`)
7. Integración en layouts (`AdminLayout.vue`, `AppLayout.vue`)
