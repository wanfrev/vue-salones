# OpenCode System Instructions — Salones

Multi-tenant salon management system. Vue 3 SPA with Supabase backend.

---

## 1. Architecture

```
client/src/
├── business/        # Pure domain logic (no Vue, no Supabase)
├── components/      # UI components by domain
│   ├── agenda/
│   ├── clientes/
│   ├── common/      # ModalBase, DrawerBase, ThemeToggle, NotificationToast
│   ├── filters/     # FilterDrawer
│   ├── finanzas/    # KpiCards, FinancialCharts, ExpensesSection, EmployeePaymentsSection, ExchangeRateCard
│   ├── forms/       # FormInput, FormSelect, FormTextarea, FormToggle, FormCheckbox, FormRadioGroup
│   ├── inventario/  # StockAdjustModal, SellFromInventoryModal
│   ├── layout/      # AdminLayout, AppLayout, Sidebar + sidebarLinks.ts
│   ├── modals/      # CitaFormModal, ClienteFormModal, EmpleadoFormModal, ServicioFormModal, ProductoFormModal
│   ├── pos/         # POSCart, POSPaymentPanel, POSAppointmentSelector
│   └── productos/   # ProductStats
├── composables/     # Stateful logic (TanStack Query + reactive state)
├── lib/             # Pure utilities (no Vue reactivity)
│   ├── csv.ts, exportCsv.ts
│   ├── errors.ts       # AppError, handleDbError
│   ├── formatters.ts   # getInitials, formatMethod, getStatusLabel, formatDate, etc.
│   ├── supabase.ts     # Typed Supabase client for reads
│   ├── typedSupabase.ts # `mutate` — centralized `as any` for writes
│   └── validation.ts   # Zod schemas (citaFormSchema, posSaleSchema, clienteFormSchema)
├── mappers/         # Transform DB ↔ View types
├── services/        # Thin data access layer (Supabase queries)
├── store/           # Pinia stores (auth, business, theme)
├── types/           # View models (cita.ts, cliente.ts, etc.) + database.ts + helpers.ts
└── views/           # Route-level views (lean, delegate to composables + components)
```

### Layer rules

| Layer | Importa desde | NO importa desde |
|---|---|---|
| `business/` | Nada del proyecto | Vue, composables, services, stores |
| `lib/` | `types/`, paquetes npm | Vue, services, stores, business |
| `services/` | `lib/`, `mappers/`, `types/` | Vue, stores, components |
| `composables/` | `services/`, `store/`, `lib/` | Components, views |
| `components/` | `composables/`, `lib/` | Services directly |
| `views/` | `composables/`, `components/`, `store/`, `lib/` | Services directly |

---

## 2. Data Flow

```
DB (Supabase)
  → services/*.ts        (queries, typed reads, mutate writes)
    → business/*.ts       (pure domain logic — computeClientStats, stockRules, etc.)
      → composables/*.ts  (TanStack Query + reactive state)
        → views/*.vue      (orquestan)
          → components/*.vue  (presentan)
```

**Regla de oro:** Una vista nunca importa un servicio directamente. Siempre a través de un composable.

---

## 3. Routing

Las rutas admin son hijas de `/admin` con `AdminLayout` como contenedor:

```
/admin                    → Admin.vue (dashboard)
/admin/clientes           → Clientes.vue
/admin/clientes/:id       → ClienteHistorial.vue
/admin/finanzas           → Finanzas.vue
/admin/equipo             → Equipo.vue
/admin/servicios          → Servicios.vue
/admin/productos          → Productos.vue
/admin/inventario         → Inventario.vue
/admin/pos                → POS.vue
```

Rutas empleado (planas):
```
/dashboard/agenda         → EmployeeAgenda.vue
/dashboard/historial      → EmployeeHistorial.vue
/dashboard/comisiones     → EmployeeComisiones.vue
/dashboard/recibo         → EmployeeRecibo.vue
```

- `AdminLayout.vue` usa `<router-view />`, no `<slot />`.
- Las rutas admin llevan `meta: { requiresAuth: true, adminOnly: true }`.
- Rutas legacy (`/clientes`, `/finanzas`, etc.) redirigen automáticamente a `/admin/*`.
- El `beforeEach` guard maneja auth, roles y redirects.

---

## 4. Servicios (`services/`)

Capa DELGADA de data access. NO contienen lógica de negocio.

```ts
// ✅ Correcto
export const listClientes = async (businessId: string): Promise<Cliente[]> => {
  const { data, error } = await supabase.from('clients').select('*').eq('business_id', businessId)
  if (error) throw error
  return (data as Client[]).map(mapClientToCliente)
}

// ❌ Incorrecto — la lógica de negocio va en business/ o composables/
export const listClientes = async (businessId: string): Promise<Cliente[]> => {
  // ...query...
  const stats = computeExpensiveStats(data) // NO
  return clients.map(c => enrichWithStats(c, stats)) // NO
}
```

### Patrones obligatorios

1. **Reads** usan `supabase` (cliente tipado de `lib/supabase`).
2. **Writes** usan `mutate` de `lib/typedSupabase.ts` (único escape `as any` autorizado).
3. **NO** declarar `const writableSupabase = supabase as any` localmente.
4. **Exportar `*Keys` factory** para TanStack Query:
   ```ts
   export const clientesKeys = {
     all: (businessId?: string | null) => ['clientes', businessId] as const,
   }
   ```
5. **Errores**: dejar que `handleDbError` los procese, o usar `AppError` para errores de negocio conocidos.

---

## 5. Composición con TanStack Query

Los composables son el puente entre servicios y vistas. Manejan queries, mutations y estado reactivo.

```ts
// composables/useClientFilters.ts
export function useClientFilters(clients: Ref<Cliente[]>) {
  const searchQuery = ref('')
  const filtered = computed(() => /* ... */)
  return { searchQuery, filtered, ... }
}`

**`useCrud`** — composable genérico que abstrae el patrón CRUD:
```ts
const {
  items,          // Ref<T[]> — datos listos para la plantilla
  isLoading,      // Ref<boolean>
  saveMutation,   // UseMutationReturn | null
  deleteMutation, // UseMutationReturn | null
  handleSave,     // (data) => Promise<void>
  handleDelete,   // (id) => void
} = useCrud<T, TForm>({
  businessId,
  queryKey: (id) => entityKeys.all(id),
  queryFn: (id) => listEntity(id),
  saveFn: (id, data) => saveEntity(id, data),
  deleteFn: (id) => deleteEntity(id),
  entityName: 'Cliente',
  modalRef,
})
```

### Query Key Conventions

Todas las factories siguen el patrón `['domain', businessId, ...filters]`:

```ts
export const agendaKeys = {
  appointments: (businessId?: string | null) => ['appointments', businessId] as const,
}

export const clientesKeys = {
  all: (businessId?: string | null) => ['clientes', businessId] as const,
}

export const posKeys = {
  pending: (businessId?: string | null) => ['pos-pending', businessId] as const,
  products: (businessId?: string | null) => ['pos-products', businessId] as const,
}

export const dashboardKeys = {
  services: (businessId?: string | null, employeeId?: string | null) =>
    ['dashboard-services', businessId, employeeId] as const,
  payments: (businessId?: string | null, employeeId?: string | null) =>
    ['dashboard-payments', businessId, employeeId] as const,
  history: (businessId?: string | null, employeeId?: string | null) =>
    ['dashboard-history', businessId, employeeId] as const,
}
```

---

## 6. Lógica de Negocio (`business/`)

Funciones PURAS, sin dependencias de Vue, Supabase o stores.

```ts
// business/clientStats.ts
export function computeClientStats(services: Service[], appointments: Appointment[]): Map<string, ClientStats> {
  // Solo transformación de datos, sin efectos secundarios
}
```

Módulos actuales:
- `clientStats.ts` — estadísticas de clientes
- `productWorkflow.ts` — crear ubicación + stock inicial al crear producto
- `stockRules.ts` — validación de venta y ajuste de inventario

---

## 7. Tipos

### Jerarquía de tipos

1. **`types/database.ts`** — generado por `supabase gen types`. Nunca editado manualmente.
2. **`types/helpers.ts`** — utilities genéricas:
   ```ts
   InsertFor<'appointments'>   // type del INSERT
   UpdateFor<'appointments'>   // type del UPDATE
   RowFor<'appointments'>      // type del row
   Joined<'appointments', Relations>  // row + joins
   ```
3. **`types/cita.ts`, `types/cliente.ts`, etc.** — View models con nombres en español (`Cita`, `Cliente`). Mapeados desde DB types por `mappers/`.

### typedSupabase

```ts
import { supabase } from '../lib/supabase'   // Para reads (tipado)
import { mutate } from '../lib/typedSupabase' // Para writes (escape)
```

`mutate` es el ÚNICO `as any` autorizado en el códigobase. Si los tipos generados mejoran en el futuro, solo hay que tocar este archivo.

---

## 8. Validación (Zod)

`lib/validation.ts` contiene schemas para datos de entrada críticos:

```ts
citaFormSchema      // Validación de formulario de citas
posSaleSchema       // Validación de venta POS
clienteFormSchema   // Validación de formulario de cliente
```

Uso en servicios:
```ts
const parsed = citaFormSchema.safeParse(data)
if (!parsed.success) {
  throw new Error(parsed.error.issues.map(e => e.message).join('. '))
}
```

---

## 9. Error Handling

```ts
import { AppError, handleDbError } from '../lib/errors'
```

- **`AppError`** — error con `code` y `hint`.
- **`handleDbError`** — mapea códigos PostgreSQL a mensajes en español (`23505` → "Este registro ya existe").
- En servicios, lanzar errores crudos y dejar que el composable los capture y muestre al usuario.

---

## 10. Formateadores Centralizados

`lib/formatters.ts` — todas las funciones de formato en un solo lugar:

```ts
getInitials(name?)           // Iniciales para avatar
formatMethod(method)         // 'cash' → 'Efectivo'
getStatusLabel(status)       // 'confirmed' → 'Confirmada'
getStatusColor(status)       // 'confirmed' → 'bg-primary/10 text-primary'
normalizeAppointmentStatus() // Normaliza paid/no_show/completed
formatDate(date, format?)    // Fecha en español
formatTime(date)             // HH:mm
formatDateTime(date)         // Fecha + hora
toISODate(date)              // YYYY-MM-DD
sanitizePhone(phone)         // Solo dígitos
minutesToHHmm(minutes)       // 90 → '01:30'
dateToHHmm(date)             // Date → '14:30'
formatNumber(n)              // Separador de miles
```

Moneda se maneja a través de `useCurrency()` (formato USD/VES).

---

## 11. Stores (Pinia)

| Store | Responsabilidad | NO contiene |
|---|---|---|
| `auth` | `user`, `session`, `profile`, `role`, `businessId` | Datos del negocio, terminología |
| `business` | `business`, `terminology`, `jobTitles`, `serviceCategories`, `nicheType` | Auth |
| `theme` | Modo claro/oscuro/sistema, persistido en localStorage | — |

Cuando auth carga exitosamente, llama a `businessStore.loadBusiness(businessId)`.

---

## 12. CSV Export

```ts
import { downloadCsv } from '../lib/csv'
downloadCsv('reporte.csv', csvString)

import { exportToCsv } from '../lib/exportCsv'
exportToCsv(rows, 'reporte.csv')
```

---

## 13. PWA / Workbox

`vite.config.ts` — 4 reglas de runtime caching:

| Handler | Estrategia | Cache | TTL |
|---|---|---|---|
| `rest/v1` + `rpc/v1` | NetworkFirst | supabase-api | 1 día |
| `storage/v1/object` | StaleWhileRevalidate | supabase-storage | 7 días |
| `fonts.*` | StaleWhileRevalidate | fonts | 30 días |
| `.(png\|jpg\|webp\|svg…)` | StaleWhileRevalidate | images | 30 días |

---

## 14. Layout

- **AdminLayout**: Header + Sidebar + `<router-view />`. Componente ruta padre.
- **AppLayout**: Layout empleado. Usa `<slot />`.
- **Sidebar**: Data-driven desde `sidebarLinks.ts`. Renderiza secciones con `v-for`.
- Las vistas admin NO se envuelven en AdminLayout (lo heredan del router).

---

## 15. Reglas para NO repetir errores del pasado

### ❌ Lo que NO se debe hacer

1. **No declarar `supabase as any` en servicios.** Usar `mutate` de `lib/typedSupabase.ts`.
2. **No poner lógica de negocio en servicios.** Va en `business/`.
3. **No poner queries de Supabase en vistas o componentes.** Van en servicios vía composables.
4. **No usar strings literales como query keys.** Usar factories exportadas por el servicio.
5. **No definir `formatDate`, `getInitials`, `formatMethod` localmente.** Usar `lib/formatters.ts`.
6. **No copiar Blob/download logic.** Usar `downloadCsv` de `lib/csv.ts`.
7. **No envolver vistas admin en AdminLayout.** El router lo hace automáticamente.
8. **No desestructurar `useCrud` parcialmente.** Extraer también `deleteMutation`/`handleDelete` si la vista tiene borrado.
9. **No dejar TODOs de funcionalidad sin implementar.** Si un botón de eliminar existe, debe funcionar.
10. **No hardcodear payment methods, status labels o categorías en templates.** Usar `formatters.ts`.

### ✅ Lo que SÍ se debe hacer

1. **Vistas por debajo de 400 líneas.** Si crece, extraer composable o subcomponente.
2. **Composables por dominio de negocio.** Cada flujo importante tiene su composable.
3. **Un archivo = una responsabilidad.** Servicio → data access. Composable → estado + queries. Componente → UI. Business → lógica pura.
4. **Mappers para transformar DB → View model.** No acoplar templates a `database.ts`.
5. **`safeParse` con Zod antes de escribir a DB.** Validar entrada en servicios.
6. **`handleDbError` para errores de DB.** Traducir códigos PostgreSQL a mensajes legibles.
7. **Exportar factories de query keys en cada servicio.** Siempre el mismo patrón.
8. **Soft deletes (`active: false`) en lugar de DELETE físico** para integridad referencial.

---

## 16. Development

### Mock (sin Docker)
```
VITE_USE_LOCAL_MOCK=true
```
Credenciales: `admin@demo.com` / `demo123`. Mock data en `lib/mock/`.

### Supabase local (Docker)
```bash
supabase start
supabase db reset
```

### TypeScript Codegen
```bash
supabase gen types typescript --local > client/src/types/database.ts
```

### Build
```bash
cd client && npm run build
```

### Edge Functions
```bash
supabase functions deploy manage-user
```
La función `manage-user` gestiona la creación, actualización (incluyendo email) y eliminación de usuarios en Supabase Auth. Debe desplegarse después de cualquier cambio en `supabase/functions/manage-user/index.ts`.
