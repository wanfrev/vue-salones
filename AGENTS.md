# AGENTS.md — Salones

Multi-tenant salon management system. Vue 3 SPA + Supabase (PostgreSQL/PostgREST/Auth/Edge Functions).

> **Regla de oro**: cuando un componente o vista crezca más allá de ~200 líneas, extrae antes de añadir más funcionalidad. **Antes** de tocar una tabla en una migración, lee su `CREATE TABLE` actual — nunca adivines nombres de columna.

---

## 1. Filosofía de código

1. **Componentizar siempre.** Vistas >200 líneas, modales >100 líneas, composables >150 líneas → extraer.
2. **Pure functions primero.** Lógica de dominio en `business/` (sin Vue, sin Supabase, sin stores).
3. **Una responsabilidad por archivo.** Servicio = data access. Composable = estado + queries. Componente = UI. Mapper = DB ↔ View.
4. **Nada de SQL ni Supabase en componentes o vistas.** Siempre a través de composables y servicios.
5. **Nada de Vue en `lib/` o `services/`.** Solo `lib/` permite tipos.
6. **Idempotencia en migraciones SQL.** `create or replace` para funciones. `drop if exists` + `create` para policies/triggers.
7. **Backward compatibility en SELECTs.** Si una columna puede no existir, no la incluyas en `select(...)` explícito. Usa `select('*')` o defaults.
8. **Tests primero en lógica crítica.** Formularios, mappers, cálculos de comisión, validadores. Si lo cambias, los tests lo atrapan.

---

## 2. Arquitectura

```
client/src/
├── business/         # Pure domain logic (no Vue, no Supabase)
│   ├── employeeEarnings.ts        # computeServiceEarnings (commission calc)
│   ├── clientStats.ts             # aggregate client metrics
│   ├── productWorkflow.ts         # createInitialStock, ensureDefaultLocation
│   └── stockRules.ts              # inventory validation/sale rules
│
├── components/       # UI components by domain
│   ├── agenda/       # AgendaCalendar, AgendaListView, AgendaMonthView, AgendaYearView
│   ├── clientes/     # ClientStats, NicheFields
│   ├── common/       # UI primitives reutilizables (ver §3)
│   ├── filters/      # FilterDrawer
│   ├── finanzas/     # KpiCards, FinancialCharts, ExpensesSection, EmployeePaymentsSection,
│   │                 # ExchangeRateCard, CurrencyBreakdown
│   ├── forms/        # FormInput, FormSelect, FormTextarea, FormToggle, FormCheckbox, FormRadioGroup
│   ├── inventario/   # StockAdjustModal, SellFromInventoryModal
│   ├── layout/       # AdminLayout, AppLayout, Sidebar, sidebarLinks
│   ├── modals/       # CitaFormModal, ClienteFormModal, EmpleadoFormModal,
│   │                 # ServicioFormModal, ProductoFormModal, BranchFormModal
│   ├── pos/          # POSCart, POSPaymentPanel, POSAppointmentSelector, POSQuickSell
│   ├── productos/    # ProductStats
│   └── servicios/    # ServiceCard
│
├── composables/      # Stateful logic (TanStack Query + reactive state)
│   ├── useAuth.ts                # login/logout wrappers
│   ├── useCrud.ts                # generic CRUD factory (items, saveMutation, deleteMutation)
│   ├── useCurrency.ts            # formatUSD, formatVES*, exchangeRate
│   ├── useNotification.ts        # success/error/warning wrappers
│   ├── useNotificationBell.ts    # notification list
│   ├── useDrawer.ts, useModal.ts # UI state helpers
│   ├── useFinancialSummary.ts    # KPIs, transactions, expenses, employee earnings
│   ├── useExpenses.ts            # expense list + form state
│   ├── useSuppliers.ts           # supplier list + payments
│   ├── useEmployeePayments.ts    # employee payments + consumption
│   ├── useBranches.ts            # branch list + form state
│   ├── useExchangeRate.ts        # edit exchange rate
│   ├── useAppointmentMutations.ts # saveCita, deleteCita wrappers
│   ├── useAdminAgenda.ts, useAgenda.ts # admin/employee agenda
│   ├── useClientFilters.ts, usePagination.ts
│   ├── useProductCRUD.ts, usePOSCart.ts, usePOSPayment.ts
│   ├── useTransactionEdit.ts, useInventoryAdjustment.ts
│   ├── useBusinessTerminology.ts # t.client, t.service, t.employee shortcuts
│   ├── useCategoryCRUD.ts         # category CRUD (rename/delete) con modal state
│   ├── usePeriodSelection.ts      # selectedPeriod + selectedMonth + route query
│
├── lib/              # Pure utilities (no Vue)
│   ├── csv.ts, exportCsv.ts
│   ├── errors.ts          # AppError, handleDbError
│   ├── formatters.ts      # getInitials, formatMethod, getStatusLabel, getStatusColor,
│   │                      # normalizeAppointmentStatus, formatDate, formatTime, etc.
│   ├── supabase.ts        # Typed Supabase client for reads
│   ├── typedSupabase.ts   # `mutate` — centralized `as any` for writes
│   ├── validation.ts      # Zod schemas (citaFormSchema, posSaleSchema, clienteFormSchema)
│   ├── periodUtils.ts     # resolvePeriod, currentMonthKey
│   ├── currencyNotes.ts   # LEGACY — solo lectura de notas viejas
│   └── (test files alongside each)
│
├── mappers/          # DB ↔ View transformations
│   ├── agendaMapper.ts       # mapCitaFormToAppointmentInsert, mapAppointmentToCita
│   ├── clientesMapper.ts
│   ├── empleadosMapper.ts
│   ├── productosMapper.ts
│   ├── serviciosMapper.ts    # mapServiceToServicio, iconByCategory
│   └── finanzasMapper.ts
│
├── services/         # Thin data access layer (Supabase queries)
│   ├── agendaService.ts          # listCitas, saveCita (orchestrates), deleteCita
│   ├── adminService.ts
│   ├── branchesService.ts
│   ├── clientesService.ts       # includes findOrCreateClientByPhone
│   ├── employeeDashboardService.ts
│   ├── employeePaymentsService.ts
│   ├── equipoService.ts
│   ├── expensesService.ts       # native currency columns
│   ├── inventarioService.ts
│   ├── notificationService.ts
│   ├── posService.ts
│   ├── productosService.ts
│   ├── proveedoresService.ts
│   ├── serviciosService.ts
│   ├── superadminService.ts
│   └── suppliersService.ts
│
├── store/            # Pinia stores
│   ├── auth.ts          # user, session, profile, role, businessId, initialize
│   ├── business.ts      # business, terminology, features, hasFeature
│   └── theme.ts
│
├── types/            # View models + database types
│   ├── database.ts         # Generated from supabase
│   ├── helpers.ts          # InsertFor<'table'>, UpdateFor<'table'>, RowFor<'table'>
│   ├── cita.ts, cliente.ts, empleado.ts, servicio.ts, producto.ts, etc.
│
└── views/            # Route-level views (lean, delegate to composables + components)
    ├── admin/             # AdminLayout + 8 route views
    ├── employee/          # 7 employee views
    ├── Admin.vue, Calendario.vue, Clientes.vue, ClienteHistorial.vue
    ├── Configuracion.vue  # branches management
    ├── Dashboard.vue       # legacy tabbed dashboard
    ├── EmpleadoRecibos.vue
    ├── Equipo.vue, Servicios.vue, Productos.vue, Inventario.vue
    ├── POS.vue, Proveedores.vue, Login.vue
    ├── Superadmin.vue, SuperadminBusinessAdmins.vue, SuperadminBusinessDetail.vue
    ├── Finanzas.vue, FinanzasRegistros.vue
```

### Layer rules

| Layer | Importa desde | NO importa desde |
|---|---|---|
| `business/` | Nada del proyecto | Vue, composables, services, stores |
| `lib/` | `types/`, paquetes npm | Vue, services, stores, business |
| `services/` | `lib/`, `mappers/`, `types/` | Vue, stores, components |
| `mappers/` | `lib/`, `types/` | Vue, services, stores, components |
| `composables/` | `services/`, `store/`, `lib/`, `types/` | Components, views |
| `components/` | `composables/`, `lib/`, otros components | Services directly, views |
| `views/` | `composables/`, `components/`, `store/`, `lib/` | Services directly |
| `store/` | `services/`, `lib/`, `types/` | Components, views |

---

## 3. Componentes reutilizables en `components/common/`

| Componente | Props | Uso |
|---|---|---|
| `ModalBase` | isOpen, title, icon, variant, size, confirmText, cancelText, loading | Todos los modales de acción |
| `DrawerBase` | isOpen, title | Paneles laterales |
| `ThemeToggle` | — | Dark/light/system |
| `NotificationBell` | — | Campana de notificaciones |
| `NotificationDropdown` | — | Lista de notificaciones |
| `NotificationToast` | type, message | Toasts transitorios |
| `SectionCard` | title, subtitle, icon, noPadding | Wrappers de sección (rounded-xl border bg-surface shadow-sm) |
| `SegmentedTabs` | tabs, v-model | Tabs segmentados con iconos |
| `EmptyState` | icon, title, subtitle, actionLabel | Estado vacío con icono |
| `StatCard` | icon, iconColor, value, label, sublabel | Tarjetas de estadística |
| `DualAmount` | amount, primaryCurrency, exchangeRate, size | Display USD + VES apilado |
| `FeatureGate` | feature | Protege vistas: muestra "no disponible" si el feature está OFF |

Exports: `import { ModalBase, StatCard, ... } from '../components/common'`

---

## 4. Composables clave y cuándo usarlos

| Composable | Para qué |
|---|---|
| `useCrud<T, F>` | CRUD genérico con `items`, `saveMutation`, `deleteMutation`, `handleSave`, `handleDelete`. Usar para: servicios, productos, empleados, clientes. |
| `useCurrency` | `formatUSD`, `formatVES`, `formatVESEs`, `formatVESInline`, `exchangeRate` (computed). SIEMPRE que se muestren montos. |
| `useBusinessTerminology` | `t.client`, `t.service`, `t.employee`, `t.appointment` con fallbacks. Usar en lugar de `businessStore.terminology.x \|\| 'fallback'`. |
| `useCategoryCRUD` | Estado de modales rename/delete categorías + handlers. Usar donde haya gestión de categorías. |
| `useBranches` | Lista de sucursales + form state. Usar en `Configuracion.vue`. |
| `useBusinessStore` (Pinia) | `features`, `hasFeature(key)`, `isMultiBranch`, `terminology`, `loadBusiness(id)` |

---

## 5. Sistema de feature flags (por negocio)

`businesses.features` JSONB con defaults:
```json
{ "pos": true, "inventario": true, "productos": true, "proveedores": true, "multi_branch": false }
```

- **Superadmin** togglea desde `/superadmin/business/:id` → sección "Funcionalidades"
- **Sidebar** filtra links según `link.requiresFeature`
- **Vistas** protegidas con `<FeatureGate feature="x">` muestran "Funcionalidad no disponible"
- **Store** expone `businessStore.hasFeature('pos')` para gating programático

Para agregar un feature nuevo: añadirlo al JSONB default en la migración, al whitelist del `update_business` en `superadmin-invite` y al whitelist del mock, agregar un toggle en `featureToggles` array del superadmin, y `requiresFeature` en el sidebar link.

---

## 6. Multi-tenant: cómo funciona el aislamiento

- **Auth**: `authStore.profile.business_id` viene del JWT + tabla `profiles`
- **Business store**: `loadBusiness(businessId)` se llama tras login, expone `features`, `terminology`, `isMultiBranch`
- **RLS**: todas las tablas operativas tienen `business_id` + políticas `is_admin_of()`, `is_staff_of()`
- **Edge Functions**: `manage-user`, `superadmin-invite` validan cross-business para update/delete
- **Superadmin**: `business_id = null` en profile, tiene acceso total bypass RLS

⚠️ **Nunca** hagas `from(...).select('*')` sin `.eq('business_id', ...)` — es un agujero de seguridad.

---

## 7. Manejo de moneda dual (USD/VES)

- **`transactions.total_amount`, `expenses.amount`, `employee_payments.amount`**: SIEMPRE en USD
- **`transactions.currency`, `expenses.currency`, `employee_payments.currency`**: `'USD' | 'VES'`
- **Monto original en VES** (si aplica): `original_amount` numeric
- **Tasa al momento del cobro**: `exchange_rate_used` numeric
- **Tasa del día del negocio**: `businesses.ves_exchange_rate` (default 36.5)
- **Conversión**: `formatVES(usd, rate?)` = `formatVESEs(usd * (rate || exchangeRate.value))`
- **Mostrar en pantalla**: usar `<DualAmount>` o `formatUSD() + formatVESInline()`
- **Legacy**: si encuentras `[VES:500:40]` en `notes`, es dato viejo de antes de la migración `20260623145411_native_currency_columns.sql`. El backfill ya lo migró.

---

## 8. Convenciones de código

### Naming
- **Tipos DB** (generados por `supabase gen types`): `Business`, `Profile`, `Appointment`
- **View models** (en `types/`): `Cita`, `Cliente`, `Empleado`, `Servicio`, `Producto`
- **Composables**: `use` + sustantivo (`useExpenses`, `useBranches`)
- **Services**: sustantivo + sufijo (`expensesService`, `branchesService`)
- **Composers** que NO usan Vue: función pura (`computeServiceEarnings`)
- **Columnas DB**: `snake_case`. **Props/TypeScript**: `camelCase`
- **Enums DB**: `text` con `check` constraint (no `enum` nativo)

### Formularios
- Usar `useCrud` cuando es CRUD simple de un solo registro
- Para forms complejos (CitaFormModal con múltiples servicios), extraer estado a composable
- Validar con Zod (`citaFormSchema`, `posSaleSchema`, `clienteFormSchema`) antes de cualquier write
- Formularios como `ModalBase` cuando son acciones sobre datos existentes
- Formularios fullscreen como `FormInput`/`FormSelect` cuando es una vista completa

### Servicios
- **Reads**: `supabase` (tipado) de `lib/supabase.ts`
- **Writes**: `mutate` de `lib/typedSupabase.ts` (único `as any` autorizado)
- **Errores**: capturar, envolver en `AppError`, o pasar a `handleDbError`
- **Returns**: SIEMPRE tipar el retorno explícitamente (`Promise<Service[]>`)
- **Exportar query keys**: `export const xxxKeys = { all: (id) => [...] }`

### Vistas
- <200 líneas ideal, <300 aceptable, >400 refactorizar YA
- Header + stats + content + modals
- Composición sobre herencia: usar secciones (`SectionCard`) y `v-for`
- Modales al final del template
- Lógica en `<script setup>`, mínimo en template

### Componentes
- `defineProps` + `defineEmits` con tipos
- `v-bind="$attrs"` solo si se necesita
- `v-model` con `defineModel` o `defineProps` + `defineEmits` (preferir este)
- Slots nombrados para variantes (`header-actions`, `footer`)
- Componentes reutilizables van en `components/common/`
- Componentes específicos de dominio van en `components/<domain>/`

---

## 9. Patrones de uso de Supabase

```ts
// READS (tipados)
import { supabase } from '../lib/supabase'
const { data, error } = await supabase.from('services').select('*').eq('business_id', id)
if (error) throw error

// WRITES (escape tipado autorizado)
import { mutate } from '../lib/typedSupabase'
const { error } = await mutate.from('services').update(payload).eq('id', id)
if (error) handleDbError(error, 'Error al actualizar')

// QUERY KEYS
export const serviciosKeys = {
  all: (businessId?: string | null) => ['servicios', businessId] as const,
}

// USO CON TANSTACK QUERY
import { useQuery } from '@tanstack/vue-query'
const { data, isLoading } = useQuery({
  queryKey: computed(() => serviciosKeys.all(businessId.value)),
  queryFn: () => listServicios(businessId.value!),
  enabled: computed(() => !!businessId.value),
})
```

---

## 10. Patrones de migraciones SQL

### Nuevas columnas
```sql
alter table public.businesses
  add column if not exists features jsonb not null default '{
    "pos": true, "inventario": true
  }'::jsonb;
```

### Nuevas funciones (siempre idempotente)
```sql
create or replace function public.fn_xyz()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp   -- OBLIGATORIO en security definer
as $$
begin
  -- body
  return new;
end;
$$;
```

### Nuevas policies
```sql
drop policy if exists "old_name" on public.table;
create policy "new_name"
  on public.table for action
  to role
  using (condition);
```

### Triggers
```sql
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_xyz') then
    create trigger trg_xyz
      after insert on public.table
      for each row execute function public.fn_xyz();
  end if;
end;
$$;
```

### Antes de escribir una función que toca una tabla
1. **Lee el `CREATE TABLE` actual** de esa tabla
2. **Lee la versión más reciente de la función original** (puede haber sido actualizada en migraciones posteriores)
3. **Usa exactamente los mismos nombres de columna** que la tabla
4. **Agrega `set search_path = public, pg_temp`** a toda función `security definer`
5. **Prueba con `supabase db reset` localmente** antes de commitear

---

## 11. Edge Functions

Tres funciones en `supabase/functions/`:

| Función | Acción | Autorización |
|---|---|---|
| `manage-user` | create / update / delete | superadmin o admin del mismo business, valida target user en mismo business |
| `superadmin-invite` | create / update_business / suspend / resume / delete | solo superadmin |
| `generate-reminders` | cron-triggered | CRON_SECRET o JWT válido |

**Deploy**: `supabase functions deploy <name>`. Las funciones tienen fallback en el frontend que llama directamente al DB si la función no está disponible (aunque con menos atomicidad).

---

## 12. Testing

### Framework
- **vitest** con `happy-dom`, globals habilitados
- Tests junto a los archivos: `validation.ts` → `validation.test.ts`
- 81 tests actuales, 5 archivos

### Qué testear
- **Validación Zod** (formularios) — SIEMPRE
- **Mappers DB ↔ View** — SIEMPRE
- **Funciones de `business/`** (cálculos puros) — SIEMPRE
- **Composables de TanStack Query** — solo si la lógica es no trivial
- **Componentes Vue** — solo lógica crítica de presentación
- **Flujos end-to-end** — mínimo, solo el core (crear cita → cobrar → recibo)

### Cómo correr
```bash
npm run test          # una vez
npm run test:watch    # watch mode
```

### Antes de cualquier cambio en producción
1. Correr `npm run test` — todos pasan
2. Correr `npm run build` — compila sin errores
3. Si la migración toca tablas: `supabase db reset` + `supabase db push` localmente
4. Si la migración toca Edge Functions: `supabase functions serve` y probar manualmente
5. Probar en el navegador: login → cada flujo principal (crear cita, cobrar, recibo)

---

## 13. Variables de entorno

Frontend:
- `VITE_SUPABASE_URL` — URL del proyecto Supabase
- `VITE_SUPABASE_ANON_KEY` — Anon key (público, seguro)
- `VITE_USE_LOCAL_MOCK=true` — usa mock client en vez de Supabase real (solo dev)

Edge Functions (en Supabase Dashboard):
- `SUPABASE_URL` — auto
- `SUPABASE_SERVICE_ROLE_KEY` — auto
- `CRON_SECRET` — random string para `generate-reminders`

---

## 14. Comandos útiles

```bash
# Cliente
cd client
npm run dev          # Vite dev server
npm run build        # Production build
npm run test         # Run all tests
npm run test:watch   # Watch tests

# Supabase local
supabase start       # Start local Docker
supabase stop        # Stop
supabase db reset    # Reset + run all migrations
supabase db push     # Push pending migrations
supabase gen types typescript --local > client/src/types/database.ts

# Edge Functions
supabase functions deploy manage-user
supabase functions deploy superadmin-invite
supabase functions deploy generate-reminders
supabase functions serve manage-user  # local testing

# Git
git status
git diff
```

---

## 15. Decisiones arquitectónicas recientes (memorándum)

- **2026-06-24**: Columna `features` JSONB en `businesses` para feature flags por negocio. Superadmin puede activar/desactivar POS, Inventario, Productos, Proveedores, Multi-sucursal.
- **2026-06-24**: Tabla `branches` con `branch_id` en tablas operativas. Gated por `businesses.features.multi_branch`. Default branch auto-creado via trigger.
- **2026-06-23**: Columnas nativas de moneda (`currency`, `original_amount`, `exchange_rate_used`) en `expenses` y `employee_payments`. Eliminado el anti-patrón `[VES:...]` en notes.
- **2026-06-23**: `production_hardening.sql` — notifications policy restringido, set search_path en security definer, default role cambiado a 'empleado'.
- **2026-06-23**: Refactor de Finanzas.vue (1162→1013), Servicios.vue (486→305), Equipo.vue (924→889). 5 componentes genéricos nuevos (EmptyState, StatCard, SectionCard, SegmentedTabs, DualAmount). 3 composables nuevos (useBusinessTerminology, useCategoryCRUD, usePeriodSelection).
- **2026-06-23**: 81 tests (employeeEarnings, formatters, currencyNotes, validation, agendaMapper).

---

## 16. Lecciones aprendidas (no repetir)

1. **Nunca adivinar nombres de columna en funciones SQL.** Leer el `CREATE TABLE` primero.
2. **`set search_path` en TODA función `security definer`.** PostgreSQL es vulnerable sin él.
3. **`create policy if not exists` no existe en PostgreSQL.** Usar `drop if exists` + `create`.
4. **Backfill en migraciones** debe manejar TODOS los formatos de datos existentes. Si notas viejas tienen 2 formatos, escribir 2 UPDATEs separados.
5. **Backward compatibility**: no romper código que ya funciona por una columna nueva. Hacer el código tolerar `undefined`.
6. **Mocks**: incluir TODAS las columnas que el código accede, o el mock devolverá `undefined` en runtime aunque typecheck pase.
7. **Tests primero** en lógica crítica: validación, mappers, cálculos. El bug de las funciones de notificación se habría detectado con un test de creación de cita.
8. **Build en CI/CD**: nunca commitear sin correr `npm run build` + `npm run test`.

---

## 17. Checklist antes de mergear

```
[ ] npm run test pasa
[ ] npm run build pasa
[ ] vue-tsc sin errores
[ ] Si tocaste una migración: probada con `supabase db reset` localmente
[ ] Si tocaste una función SQL: leíste el CREATE TABLE actual primero
[ ] Si tocaste Edge Function: probada con `supabase functions serve`
[ ] Si agregaste un composable: usado en lugar de duplicar lógica
[ ] Si agregaste un componente reusable: puesto en `components/common/`
[ ] Si tocaste moneda: usaste columnas nativas, NO el patrón [VES:...] en notes
[ ] Si tocaste feature flags: actualizado el whitelist en `superadminService.updateBusiness` Y en `superadmin-invite` Edge Function
[ ] Si tocaste el sidebar: actualizado tanto el link como el filtro en `Sidebar.vue`
[ ] Si tocaste una vista: NO excede 400 líneas (si excede, extraer componente)
```
