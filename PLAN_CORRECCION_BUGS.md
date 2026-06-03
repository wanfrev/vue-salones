# Plan de Corrección de Bugs — Salones

## 1. Contador de citas incorrecto (Admin — Dashboard)

**Archivos involucrados:**
- `client/src/views/Admin.vue` (L149–153, L186–199)
- `client/src/services/agendaService.ts`
- `client/src/composables/useAppointmentMutations.ts`

**Causa raíz:**
La query key `agendaKeys.appointments(businessId)` → `['appointments', businessId]` no incluye el `dateRange` ni variación alguna. El computed `todayRange` se usa como parámetro de la función pero NO como parte del query key. Cuando se navega entre días en el calendario o se crean/modifican citas, la query de estadísticas NO se actualiza porque el cache key nunca cambia.

**Solución:**
1. En `Admin.vue`, cambiar el query key para incluir `toISODate(new Date())`:
   ```
   queryKey: ['appointments', businessId, toISODate(new Date())]
   ```
2. Asegurar que `useAppointmentMutations` invalide correctamente la key con prefijo `['appointments', businessId]` después de cada save/update/delete.
3. Verificar que el filtro `c.date === hoy` sea consistente con el formato que devuelve `mapAppointmentToCita`.

---

## 2. Error al eliminar clientes (Admin — Clientes)

**Archivos involucrados:**
- `client/src/services/clientesService.ts` (L79–86)

**Causa raíz:**
`deleteCliente` hace un **hard delete** físico (`supabase.from('clients').delete()`), lo que viola la regla del proyecto (soft deletes) y causa error por `foreign key constraint` cuando el cliente tiene citas asociadas en `appointments`.

**Solución:**
1. Cambiar a soft delete usando `mutate`:
   ```ts
   await mutate.from('clients').update({ active: false }).eq('id', clientId)
   ```
2. Agregar `.eq('active', true)` en `listClientes` para filtrar solo activos.
3. Usar `mutate` en lugar de `supabase` para la operación de escritura.

---

## 3. Pagos a empleados no se registran (Admin — Finanzas)

**Archivos involucrados:**
- `client/src/services/employeePaymentsService.ts` (L46–68)
- `client/src/lib/mock/mockClient.ts`

**Causa raíz:**
1. `createEmployeePayment` usa `mutate.auth?.currentUser` para obtener el usuario que crea el pago. El mock de Supabase NO expone `currentUser` — solo tiene `getSession`, `signInWithPassword`, `signOut`, `onAuthStateChange`. En mock mode, `mutate.auth?.currentUser` es `undefined`, y `created_by` queda `null`.
2. `handleDbError` en la línea 67 maneja el error pero NO lo relanza, por lo que el error se traga silenciosamente.

**Solución:**
1. Reemplazar `mutate.auth?.currentUser` por `supabase.auth.getSession()`:
   ```ts
   const { data: { session } } = await supabase.auth.getSession()
   const userId = session?.user?.id ?? null
   ```
2. Después de `handleDbError`, relanzar el error para que el mutation `onError` lo capture.

---

## 4. Transacciones recientes incompletas (Admin — Finanzas)

**Archivos involucrados:**
- `client/src/composables/useFinancialSummary.ts` (L137–193)

**Causa raíz:**
La sección "Transacciones Recientes" solo consulta la tabla `transactions` (pagos de servicios/productos). Los pagos a empleados (`employee_payments`) y los gastos (`expenses`) nunca aparecen, aunque el título sugiere que muestra toda la actividad financiera reciente.

**Solución:**
1. Crear un query unificado que combine datos de 3 tablas: `transactions`, `employee_payments`, `expenses`.
2. Transformar los 3 sets a un tipo común:
   ```ts
   { date: string, description: string, method: string, amount: number, type: 'ingreso' | 'gasto' | 'nomina' }
   ```
3. Ordenar combinado por fecha descendente y tomar los primeros 10.
4. Mostrar el `type` como indicador visual (color/icono) en la tabla.

---

## 5. Ajuste de stock en inventario no funciona (Admin — Inventario)

**Archivos involucrados:**
- `client/src/composables/useInventoryAdjustment.ts` (L8–67)
- `client/src/services/inventarioService.ts` (L155–179)
- `client/src/components/inventario/StockAdjustModal.vue`
- `client/src/business/stockRules.ts`

**Causa raíz potencial:**
1. `useInventoryAdjustment` captura `authStore.businessId` como valor directo. Si el store no está inicializado cuando el composable se crea, `businessId` es `null`. Además, no es reactivo.
2. `StockAdjustModal` maneja `adjustQuantity` que por defecto es `0`, y `confirmAdjust` retorna temprano si `adjustQuantity.value === 0`.
3. `getStockRecord` usa `supabase` (read) pero el filtro por `variant_id` podría no coincidir en mock.

**Solución:**
1. En `useInventoryAdjustment`, usar `computed(() => authStore.businessId)` para reactividad.
2. En `StockAdjustModal`, permitir valores negativos (para reducir stock) y positivos (para aumentar).
3. Verificar que `getStockRecord` filtre correctamente por `business_id`, `product_id`, `location_id` y `variant_id` (con `is('variant_id', null)` cuando no hay variante).
4. Agregar notificaciones de error más descriptivas.

---

## 6. Revisión del Punto de Venta (Admin — POS)

**Archivos involucrados:**
- `client/src/views/POS.vue`
- `client/src/services/posService.ts` (L11–44)
- `client/src/composables/usePOSPayment.ts`
- `client/src/composables/usePOSCart.ts`

**Problemas identificados:**
1. **Productos sin location:** `usePOSCart.ts:26` agrega productos con `locationId: ''`, lo que impide descontar stock real.
2. **Sin validación de stock:** No se verifica stock disponible antes de agregar al carrito.
3. **Sin invalidación de inventario post-venta:** `usePOSPayment.ts:57` invalida `['inventario']` pero no la key correcta (`inventarioKeys.all`).
4. **RPC `record_sale`:** La función debe manejar correctamente todos los métodos de pago y descuento de inventario.

**Solución:**
1. En `addProduct`, usar `listLocationsWithStock` para obtener y asignar la ubicación con stock:
   ```ts
   const locations = await listLocationsWithStock(businessId, product.id)
   if (locations.length > 0) {
     // Asignar primera ubicación con stock
   }
   ```
2. Validar stock suficiente antes de agregar al carrito.
3. Usar `inventarioKeys.all(businessId)` para invalidación post-venta.
4. Verificar y corregir el RPC `record_sale` en PostgreSQL.

---

## 7. Cerrar sesión requiere recargar (General)

**Archivos involucrados:**
- `client/src/store/auth.ts` (L139–151)
- `client/src/composables/useAuth.ts` (L25–28)
- `client/src/router/index.ts` (L142–162)

**Causa raíz:**
El flujo de `signOut()`:
1. `supabase.auth.signOut()` → mock y real disparan `onAuthStateChange` con `SIGNED_OUT`.
2. El listener en `initialize()` se ejecuta y limpia `session`, `user`, `profile`.
3. `queryClient.clear()`, `clearAuthState()`, `clearBusiness()` completan la limpieza.
4. `router.replace('/')` → `beforeEach` guard → `initialize()` skip (ya initialized).

El problema es que el `onAuthStateChange` callback y el código sincrónico de `signOut()` pueden ejecutarse en orden impredecible, especialmente si hay microtasks de por medio. Si el guard se ejecuta antes de que el estado esté completamente limpio, `isAuthenticated` puede evaluarse como `true` momentáneamente.

**Solución:**
1. En `signOut()`, llamar `clearAuthState()` y `clearBusiness()` **antes** de `supabase.auth.signOut()` para garantizar estado limpio inmediato.
2. En el `beforeEach`, verificar `!authStore.loading` además de `isAuthenticated`:
   ```ts
   if (to.meta.requiresAuth && (!authStore.isAuthenticated || authStore.loading)) {
     return '/'
   }
   ```
3. Agregar `router.replace('/')` dentro de un `nextTick()` o `setTimeout(0)` para asegurar que el estado se haya propagado.

---

## 8. Botón "Ver Agenda" muestra agenda general (Admin — Equipo)

**Archivos involucrados:**
- `client/src/views/Equipo.vue` (L238–241)
- `client/src/components/agenda/AgendaCalendar.vue`
- `client/src/composables/useAgenda.ts`

**Causa raíz:**
```ts
const handleViewAgenda = (empleado: Empleado) => {
  router.push('/admin')
  info(`Mostrando agenda de ${empleado.name}`)
}
```
Navega a `/admin` sin pasar el ID del empleado. `AgendaCalendar` no recibe ningún parámetro, así que `selectedEmployeeId` se queda como `'all'`, mostrando todas las citas de todos los empleados.

**Solución:**
1. En `Equipo.vue`, pasar el ID del empleado como query param:
   ```ts
   router.push('/admin?employee=' + empleado.id)
   ```
2. En `AgendaCalendar.vue` (o `Admin.vue`), leer el query param y asignar `selectedEmployeeId` inicial:
   ```ts
   const route = useRoute()
   if (route.query.employee) {
     selectedEmployeeId.value = route.query.employee as string
   }
   ```
   También aplicar en `onMounted` y al cambiar el query param.

---

## 9. Vistas financieras del empleado (Dashboard Empleado)

**Archivos involucrados:**
- `client/src/views/Dashboard.vue`
- `client/src/services/employeeDashboardService.ts`
- `client/src/lib/mock/mockData.ts`

**Causa raíz potencial:**
En mock mode, es posible que no existan datos mock para el empleado de prueba:
- `transactions` vinculadas al `MOCK_USER_ID` empleado
- `employee_payments` para ese empleado

En producción, el RLS debe permitir que cada empleado vea solo sus propias transacciones.

**Solución:**
1. Agregar datos mock (transacciones, pagos) vinculados al empleado de prueba en `mockData.ts`.
2. Verificar que `listEmployeeTransactions` use `appointments!inner(employee_id)` correctamente (actualmente lo hace, L83–89).
3. Verificar que `listEmployeePayments` filtre por `employee_id` (L115–127).
4. Asegurar que `financial_summary` RPC funcione para consultas por empleado.

---

## 10. Botón "Suspender" no funciona (Super Admin)

**Archivos involucrados:**
- `client/src/views/SuperadminBusinessDetail.vue` (L352–383)
- `client/src/services/superadminService.ts` (L96–108)

**Causa raíz:**
`suspendBusiness` invoca la edge function `superadmin-invite` con `action: 'suspend_business'`. Posibles fallos:
1. La edge function no está desplegada en producción o tiene errores.
2. La respuesta no incluye `success: true`, y el código lanza error genérico.
3. El mock funciona, pero en producción el RLS bloquea la operación.

**Solución:**
1. Agregar un fallback: si la edge function falla, hacer update directo:
   ```ts
   const { error } = await mutate
     .from('businesses')
     .update({ active: false })
     .eq('id', businessId)
   ```
2. Invalidar `superadminKeys.businesses()` después de suspender/reanudar.
3. Mejorar mensajes de error para diagnosticar el problema real.

---

## Resumen de cambios por archivo

| Archivo | Cambios |
|---|---|
| `services/clientesService.ts` | Soft delete con `mutate`, filtrar activos |
| `services/employeePaymentsService.ts` | Fix `currentUser` con `getSession()`, relanzar error |
| `services/superadminService.ts` | Fallback con update directo sin edge function |
| `services/posService.ts` | Validar ubicación y stock en productos |
| `composables/useFinancialSummary.ts` | Unificar transactions + employee_payments + expenses |
| `composables/useInventoryAdjustment.ts` | `businessId` reactivo con `computed` |
| `composables/useAgenda.ts` | Aceptar `employeeId` inicial desde query param |
| `composables/useAppointmentMutations.ts` | Invalidar key con prefijo `['appointments', businessId]` |
| `views/Admin.vue` | query key con fecha, leer query param `employee` |
| `views/Equipo.vue` | Pasar `employeeId` en query param |
| `views/SuperadminBusinessDetail.vue` | Mejor manejo de errores en suspend/resume |
| `views/Finanzas.vue` | Mostrar unified transactions (ingresos + gastos + nómina) |
| `store/auth.ts` | Limpiar estado antes de `signOut()` |
| `router/index.ts` | Verificar `loading` además de `isAuthenticated` |
| `lib/mock/mockClient.ts` | Agregar `currentUser` al mock auth |
| `lib/mock/mockData.ts` | Agregar datos mock faltantes |
