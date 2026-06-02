# Plan de Desacople y Componentización — Salones

Plan para reducir deuda técnica, eliminar duplicación y mejorar mantenibilidad del frontend.

---

## Diagnóstico Actual

| Problema | Gravedad | Ocurrencias |
|---|---|---|
| Vistas hinchadas (más de 300 líneas) | 🔴 Crítico | 9 vistas. Finanzas 1110 líneas, POS 534, Inventario 532… |
| Patrón CRUD duplicado en vistas | 🔴 Crítico | 7 vistas con mutations de guardado casi idénticas |
| Layout de admin repetido manualmente | 🔴 Crítico | 9 vistas copian y pegan el mismo shell de 26 líneas |
| `as any` en servicios | 🔴 Crítico | 10 de 11 archivos de servicio rompen el tipado |
| AuthStore con datos que no son de auth | 🔴 Crítico | terminology, jobTitles, nicheType y business viven en auth |
| Admin.vue y Dashboard.vue duplican lógica de citas | 🟠 Alto | 2 vistas comparten ~100 líneas de mutations idénticas |
| POS sin subcomponentes | 🟠 Alto | Carrito, pagos y split de pagos todo en un archivo |
| Sidebar monolítico | 🟠 Alto | 355 líneas con markup repetitivo sección por sección |
| Sin factory de query keys consistente | 🟡 Medio | 3 servicios sin factory, vistas usan strings literales |
| CSV export duplicado | 🟡 Medio | 2 vistas con el mismo blob+download |
| Sin validación de entrada en servicios | 🟡 Medio | Solo 1 función valida inputs antes de mandar a DB |
| Business logic mezclada con data access | 🟡 Medio | Servicios hacen cálculos de negocio que no les corresponde |
| Error handling inconsistente | 🟡 Medio | Solo agendaService tiene errores localizados en español |

---

## Fase 1 — Cimientos

Alto impacto, bajo riesgo. Elimina la duplicación más costosa y prepara el terreno para el resto.

### 1.1 Separar BusinessStore de AuthStore

**Qué:** Mover `business`, `terminology`, `jobTitles`, `serviceCategories` y `nicheType` del store de auth a un nuevo `store/business.ts`. El AuthStore se queda solo con `user`, `session`, `profile` y `role`.

**Por qué:** La terminología (ej. "Cliente" vs "Dueño" vs "Mascota") y los datos del negocio no son autenticación. Cargarlos juntos hace que un fallo en datos de negocio tumbe la sesión. Además, una ruta pública de booking necesitaría terminology sin tener auth.

**Archivos a modificar:** ~14 archivos (store/auth.ts, store/business.ts nuevo, layout, sidebar, vistas que usan terminology/jobTitles/serviceCategories/nicheType).

---

### 1.2 Crear AdminLayout compartido

**Qué:** Extraer el shell de layout que 9 vistas admin repiten (header con logo + menú hamburguesa + logout, sidebar, overlay mobile, main con padding) a un componente `AdminLayout.vue`. Cada vista admin se envuelve en `<AdminLayout>` y solo aporta su contenido.

**Por qué:** 9 copias del mismo layout significa que cualquier cambio estético o estructural (ej. añadir un elemento al header) hay que hacerlo 9 veces.

**Archivos a modificar:** Crear `AdminLayout.vue`, modificar las 9 vistas admin (Admin, Clientes, Equipo, Servicios, Productos, Inventario, Finanzas, POS, ClienteHistorial).

---

### 1.3 Crear useCrud genérico

**Qué:** Un composable que abstrae el patrón que se repite en 7 vistas: `useQuery` para listar + `useMutation` para guardar + `useMutation` para eliminar + invalidación de caché + notificación de éxito/error. Cada vista solo pasa la businessId, las funciones del service, y las query keys.

**Por qué:** El mismo bloque de ~40 líneas de mutation con `onSuccess`, `invalidateQueries`, `close modal`, `success message` está copiado en Clientes, Servicios, Productos, Equipo, Inventario y otras vistas.

**Archivos a modificar:** Crear `useCrud.ts`, modificar 5 vistas.

---

### 1.4 Extraer useAppointmentMutations

**Qué:** Un composable compartido que unifica `saveCitaMutation`, `updateCitaStatusMutation` y `updateAppointmentTimeMutation` con sus respectivos handlers. Admin.vue y Dashboard.vue (y parcialmente EmployeeAgenda.vue) tienen este código duplicado.

**Por qué:** Admin y Dashboard comparten ~100 líneas de handlers de citas (guardar, cambiar estado, drag & drop) que son funcionalmente idénticas.

**Archivos a modificar:** Crear `useAppointmentMutations.ts`, modificar Admin.vue, Dashboard.vue y EmployeeAgenda.vue.

---

### 1.5 Hacer el Sidebar data-driven

**Qué:** Reemplazar el markup manual de cada link de navegación (icono SVG inline + label + ruta + clase active + condicional de rol) por un array de definiciones de rutas que se renderiza con `v-for`. Los iconos se importan de lucide-vue-next en lugar de SVGs inline.

**Por qué:** El Sidebar tiene 355 líneas donde cada sección repite exactamente la misma estructura. Si hay que añadir una ruta nueva, hay que tocar 3 sitios distintos. Con datos, se añade una entrada al array.

**Archivos a modificar:** Crear `sidebarLinks.ts`, modificar Sidebar.vue.

---

## Fase 2 — Despiece de Vistas

Reduce las vistas más complejas extrayendo subcomponentes visuales y composables de lógica de dominio.

### 2.1 Refactorizar Finanzas.vue (1110 → ~400 líneas)

**Qué:** Es la vista más grande y problemática. Hace 6 cosas distintas: indicadores KPIs, gráficos de ingresos/gastos, CRUD de gastos, pagos a empleados, historial de transacciones y tasa de cambio. Además **no usa TanStack Query** — llama a `supabase` directamente en un `watch`.

**Acciones:**
- Migrar las 4 fuentes de datos (summary, expenses, payments, exchange rate) a TanStack Query con `useQuery`
- Extraer 5 componentes visuales: KpiCards, FinancialCharts, ExpensesSection, EmployeePaymentsSection, ExchangeRateCard
- Extraer 4 composables de datos: useFinancialSummary, useExpenses, useEmployeePayments, useExchangeRate

---

### 2.2 Refactorizar POS.vue (534 → ~250 líneas)

**Qué:** La vista POS mezcla carrito de compras, selección de método de pago, split de pagos entre varios métodos, búsqueda de productos y selección de citas pendientes en un solo archivo.

**Acciones:**
- Extraer composable `usePOSCart` con la lógica del carrito (items, total, agregar/quitar)
- Extraer composable `usePOSPayment` con la lógica de pago (método, split, saldo restante)
- Extraer 3 componentes visuales: POSCart, POSPaymentPanel, POSAppointmentSelector

---

### 2.3 Refactorizar Inventario.vue (532 → ~300 líneas)

**Qué:** Maneja 3 flujos modales distintos en una vista: ajuste de stock, venta desde inventario, y creación de producto.

**Acciones:**
- Extraer StockAdjustModal a un componente separado
- Extraer SellFromInventoryModal a un componente separado
- Crear composable `useInventoryAdjustment` para la lógica de ajuste

---

### 2.4 Refactorizar Productos.vue (478 → ~250 líneas)

**Qué:** Mezcla CRUD de productos con ajuste de stock (que es responsabilidad de inventario) y estadísticas inline.

**Acciones:**
- Mover el modal de ajuste de stock a la vista de Inventario
- Crear composable `useProductCRUD` con listado, guardado, borrado y estadísticas
- Extraer componente ProductStats

---

### 2.5 Refactorizar Clientes.vue (475 → ~280 líneas)

**Qué:** Tiene filtros (búsqueda, días sin visita, ordenamiento) combinados con paginación y exportación CSV, todo inline.

**Acciones:**
- Extraer composable `useClientFilters` que unifique búsqueda + filtros + paginación
- Mover CSV export a utilidad compartida

---

## Fase 3 — Servicios y Tipado

Elimina la fuente principal de inseguridad tipográfica, separa responsabilidades y unifica patrones.

### 3.1 Regenerar y ampliar tipos de base de datos

**Qué:** Regenerar `database.ts` con `supabase gen types` y crear tipos auxiliares para joins (select con relaciones) e inserts (omitir campos auto-generados como id, created_at).

**Por qué:** La raíz del `as any` es que los tipos generados no cubren patrones comunes como `select('*, clients(...), services(...)')`.

---

### 3.2 Eliminar `as any` con un helper tipado

**Qué:** Crear `typedSupabase()` en `lib/typedSupabase.ts` que envuelve el cliente de Supabase preservando tipos en writes y selects con relaciones. Todos los servicios dejan de usar `supabase as any` y usan este helper.

**Por qué:** 10 de 11 servicios usan `as any`, lo que anula completamente TypeScript en la capa de datos. Errores de tipeo que podrían detectarse en compilación solo se detectan en runtime.

---

### 3.3 Unificar query key factories

**Qué:** Añadir factories de TanStack Query a adminService, employeeDashboardService y posService (los 3 que no las tienen). Actualizar las vistas que usan strings literales como `['appointments']` para que usen las factories.

**Por qué:** Si Admin.vue usa `['appointments']` y agendaService exporta `agendaKeys.appointments(businessId)` que produce `['appointments', businessId]`, invalidar uno no invalida el otro. Esto causa bugs de cache.

---

### 3.4 Extraer lógica de negocio de los servicios

**Qué:** Mover cálculos de dominio a una nueva carpeta `business/`:
- `clientStats.ts`: Cómputo de lastVisit, totalAppointments, totalSpent (hoy en clientesService)
- `productWorkflow.ts`: Auto-creación de inventory location + stock al crear producto (hoy en productosService)
- `stockRules.ts`: Reglas de ajuste de stock y validación de venta (hoy en inventarioService)

**Por qué:** Los servicios deben ser una capa delgada de data access. Hoy mezclan queries SQL con lógica de dominio compleja, lo que los hace difíciles de testear y reutilizar.

---

### 3.5 Estandarizar manejo de errores

**Qué:** Crear una clase `AppError` con código, mensaje en español y hint opcional. Crear una función `handleDbError` que transforme errores comunes de Supabase (unique violation, employee overlap, foreign key) en errores legibles.

**Por qué:** Hoy solo agendaService traduce errores a español. El resto lanza errores crudos de PostgreSQL en inglés que llegan al usuario.

---

### 3.6 Añadir validación de entrada

**Qué:** Crear schemas de validación (con Zod o validación manual) para datos críticos: creación de citas, procesamiento de ventas POS, datos de cliente.

**Por qué:** Solo `sellProduct` valida inputs. El resto manda datos potencialmente inválidos a Supabase, que responde con errores 400 difíciles de interpretar.

---

### 3.7 Simplificar equipoService

**Qué:** Unificar `addBusinessCategory` y `addBusinessJobTitle` en una sola función genérica `addBusinessArrayField(businessId, column, value)`. Ambas hacen exactamente lo mismo pero con nombres de columna diferentes.

**Por qué:** ~40 líneas de código duplicado con lógica idéntica.

---

## Fase 4 — Arquitectura Avanzada

Opcional pero altamente recomendable. Routing anidado, utilidades compartidas y mejora de PWA.

### 4.1 Rutas anidadas para admin

**Qué:** Convertir las rutas planas de admin (`/admin`, `/clientes`, `/finanzas`) en rutas hijas de un layout admin (`/admin`, `/admin/clientes`, `/admin/finanzas`). El AdminLayout actúa como contenedor padre.

**Por qué:** Elimina la necesidad de que cada vista admin se envuelva manualmente en AdminLayout. Además, permite tener headers o sub-navegación específica del contexto admin.

---

### 4.2 Extraer utilidad de exportación CSV

**Qué:** Mover la lógica de crear Blob + download link (duplicada en Admin.vue y Clientes.vue) a una función `downloadCsv(filename, rows)` en `lib/csv.ts`.

**Por qué:** El patrón de 15 líneas para crear y descargar un CSV no debería estar copiado en vistas.

---

### 4.3 Extraer formateadores comunes

**Qué:** Centralizar en `lib/formatters.ts` las funciones de formato que aparecen inline en múltiples vistas y servicios: formato de moneda con símbolo, formato de fecha en español, formato de hora, iniciales de nombre, etiquetas de estado, colores de estado, nombres de métodos de pago.

**Por qué:** Hoy cada vista hace su propio formateo, lo que lleva a inconsistencias (ej. una vista muestra "USD 50" y otra "$50.00").

---

### 4.4 Mejorar estrategia de caché PWA

**Qué:** Configurar Workbox en vite.config.ts para usar `NetworkFirst` en queries a Supabase REST API (intenta red primero, cae a caché si hay error) y `StaleWhileRevalidate` en assets estáticos (fuentes, imágenes). Añadir tiempos de expiración adecuados.

**Por qué:** La configuración genérica actual no optimiza la experiencia offline. Con estos cambios, la app funciona parcialmente sin conexión (datos cacheados) y es más rápida en redes lentas.

---

## Resumen de Archivos

### Archivos nuevos (25)

```
store/business.ts
composables/useCrud.ts
composables/useAppointmentMutations.ts
composables/useFinancialSummary.ts
composables/useExpenses.ts
composables/useEmployeePayments.ts
composables/useExchangeRate.ts
composables/usePOSCart.ts
composables/usePOSPayment.ts
composables/useInventoryAdjustment.ts
composables/useProductCRUD.ts
composables/useClientFilters.ts
components/layout/AdminLayout.vue
components/layout/sidebarLinks.ts
components/finanzas/KpiCards.vue
components/finanzas/FinancialCharts.vue
components/finanzas/ExpensesSection.vue
components/finanzas/EmployeePaymentsSection.vue
components/finanzas/ExchangeRateCard.vue
components/pos/POSCart.vue
components/pos/POSPaymentPanel.vue
components/pos/POSAppointmentSelector.vue
components/inventario/StockAdjustModal.vue
components/inventario/SellFromInventoryModal.vue
components/productos/ProductStats.vue
types/helpers.ts
lib/typedSupabase.ts
lib/errors.ts
lib/validation.ts
lib/csv.ts
lib/formatters.ts
business/clientStats.ts
business/productWorkflow.ts
business/stockRules.ts
```

### Archivos a modificar (38)

```
store/auth.ts
router/index.ts
vite.config.ts
views/Finanzas.vue
views/POS.vue
views/Inventario.vue
views/Productos.vue
views/Clientes.vue
views/Admin.vue
views/Dashboard.vue
views/Equipo.vue
views/Servicios.vue
views/ClienteHistorial.vue
views/EmployeeAgenda.vue
views/Superadmin.vue
views/SuperadminBusinessDetail.vue
components/layout/AppLayout.vue
components/layout/Sidebar.vue
services/clientesService.ts
services/productosService.ts
services/inventarioService.ts
services/agendaService.ts
services/equipoService.ts
services/adminService.ts
services/employeeDashboardService.ts
services/employeePaymentsService.ts
services/posService.ts
services/serviciosService.ts
services/superadminService.ts
types/database.ts
```

---

## Cronograma Recomendado

```
Fase 1 — Cimientos (3 días)
  Día 1: BusinessStore + AdminLayout
  Día 2: useCrud + useAppointmentMutations
  Día 3: Sidebar data-driven + actualizar vistas

Fase 2 — Vistas (4 días)
  Día 1-2: Finanzas (el más crítico, 1110 a ~400 líneas)
  Día 3: POS + Inventario
  Día 4: Productos + Clientes

Fase 3 — Servicios (3 días)
  Día 1: Tipos (database.ts + helpers.ts + typedSupabase)
  Día 2: Business layer (clientStats, stockRules, productWorkflow)
  Día 3: Errores, validación, factories

Fase 4 — Pulido (2 días)
  Día 1: Nested routes + utilidades
  Día 2: PWA caching
```

---

## Métricas Post-Refactor

| Métrica | Antes | Después |
|---|---|---|
| Finanzas.vue | 1110 líneas | ~400 líneas |
| POS.vue | 534 líneas | ~250 líneas |
| Vistas de más de 400 líneas | 7 | 2 |
| Layout duplicado | 9 copias manuales | 1 componente |
| Patrón CRUD duplicado | 7+ copias | 1 composable |
| `as any` en servicios | 10 de 11 archivos | 0 |
| Sidebar | 355 líneas | ~150 líneas |
| Error handling localizado | Solo 1 archivo | Todos los servicios |
| Validación de entrada | Solo 1 función | Servicios críticos |
