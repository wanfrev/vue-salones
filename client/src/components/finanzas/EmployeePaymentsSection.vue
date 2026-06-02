<template>
  <div class="rounded-xl border border-border bg-surface p-4">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h3 class="text-base font-semibold text-text">Pagos a Empleados</h3>
        <p class="text-sm text-text-muted">Servicios realizados y comisión aplicada</p>
      </div>
      <button @click="openPaymentModal" class="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-text-inverse transition-theme hover:bg-primary-hover">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span class="hidden sm:inline">Registrar pago</span>
      </button>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-border-subtle">
            <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">{{ terminology.employee || 'Empleado' }}</th>
            <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">{{ terminology.service || 'Servicio' }}</th>
            <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Costo</th>
            <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">% {{ terminology.employee || 'Empleado' }}</th>
            <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Ganancia</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-subtle">
          <tr v-for="payment in employeePayments" :key="payment.id" class="text-sm transition-theme hover:bg-bg-secondary/50">
            <td class="py-3 font-medium text-text">{{ payment.employee }}</td>
            <td class="py-3 text-text-secondary">{{ payment.service }}</td>
            <td class="py-3 text-right">
              <div class="text-text">{{ formatUSD(payment.amount) }}</div>
              <div class="text-xs text-text-muted">Bs {{ formatVESInline(payment.amount) }}</div>
            </td>
            <td class="py-3 text-right text-text-secondary">{{ payment.percentage }}%</td>
            <td class="py-3 text-right">
              <div class="font-semibold text-success">{{ formatUSD(payment.earnings) }}</div>
              <div class="text-xs text-text-muted">Bs {{ formatVESInline(payment.earnings) }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="paymentsMade.length > 0" class="mt-4 border-t border-border-subtle pt-4">
      <div class="mb-3 flex items-center justify-between">
        <h4 class="text-sm font-semibold text-text">Pagos realizados</h4>
        <span class="text-xs text-text-muted">{{ paymentsMade.length }} pago(s)</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border-subtle">
              <th class="pb-2 text-left text-xs font-semibold uppercase text-text-muted">Fecha</th>
              <th class="pb-2 text-left text-xs font-semibold uppercase text-text-muted">{{ terminology.employee || 'Empleado' }}</th>
              <th class="pb-2 text-left text-xs font-semibold uppercase text-text-muted">Método</th>
              <th class="pb-2 text-right text-xs font-semibold uppercase text-text-muted">Monto</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-subtle">
            <tr v-for="ep in paymentsMade" :key="ep.id" class="text-sm transition-theme hover:bg-bg-secondary/50">
              <td class="py-2 text-text-secondary whitespace-nowrap">{{ ep.paymentDate }}</td>
              <td class="py-2 font-medium text-text">{{ ep.employeeName }}</td>
              <td class="py-2 text-text-secondary">{{ formatMethod(ep.paymentMethod) }}</td>
              <td class="py-2 text-right">
                <div class="font-medium text-danger">{{ formatUSD(ep.amount) }}</div>
                <div class="text-xs text-text-muted">Bs {{ formatVESInline(ep.amount) }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="showPaymentModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="closePaymentModal"
    >
      <div class="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <div class="mb-4">
          <h2 class="text-lg font-semibold text-text">Registrar pago a {{ (terminology.employee || 'empleado').toLowerCase() }}</h2>
          <p class="text-sm text-text-muted">Registra un adelanto, sueldo o comisión pagada</p>
        </div>
        <form class="space-y-4" @submit.prevent="handleSavePayment">
          <div>
            <label class="mb-1 block text-sm font-medium text-text">{{ terminology.employee || 'Empleado' }}</label>
            <select v-model="paymentForm.employeeId" required
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30">
              <option value="" disabled>Seleccionar {{ (terminology.employee || 'empleado').toLowerCase() }}</option>
              <option v-for="emp in employeeList" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1 block text-sm font-medium text-text">Monto ($)</label>
              <input v-model.number="paymentForm.amount" type="number" min="0.01" step="0.01"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="0.00" required />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-text">Método</label>
              <select v-model="paymentForm.method"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30">
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
                <option value="zelle">Zelle</option>
                <option value="pago_movil">Pago Móvil</option>
              </select>
            </div>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-text">Fecha</label>
            <input v-model="paymentForm.date" type="date"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30" required />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-text">Notas</label>
            <input v-model="paymentForm.notes" type="text"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="Ej: Comisión servicios, adelanto..." />
          </div>
          <p v-if="paymentError" class="text-sm text-danger">{{ paymentError }}</p>
          <div class="flex items-center justify-end gap-3">
            <button type="button"
              class="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition-theme hover:bg-bg-secondary"
              @click="closePaymentModal">Cancelar</button>
            <button type="submit" :disabled="savingPayment"
              class="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-text-inverse shadow-sm transition-theme hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">
              {{ savingPayment ? 'Guardando...' : 'Guardar pago' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCurrency } from '../../composables/useCurrency'
import { useNotification } from '../../composables/useNotification'
import { supabase } from '../../lib/supabase'
import { createEmployeePayment, type EmployeePaymentRecord } from '../../services/employeePaymentsService'

interface PaymentRow {
  id: string; employee: string; service: string; amount: number; percentage: number; earnings: number
}

const props = defineProps<{
  employeePayments: PaymentRow[]
  paymentsMade: EmployeePaymentRecord[]
  terminology: Record<string, string>
  businessId: string | null
}>()

const emit = defineEmits<{
  'saved': []
}>()

const { formatUSD, formatVESInline } = useCurrency()
const { success } = useNotification()
const showPaymentModal = ref(false)
const savingPayment = ref(false)
const paymentError = ref('')
const paymentForm = ref({ employeeId: '', amount: 0, method: 'cash', date: new Date().toISOString().slice(0, 10), notes: '' })
const employeeList = ref<{ id: string; name: string }[]>([])

const openPaymentModal = async () => {
  paymentForm.value = { employeeId: '', amount: 0, method: 'cash', date: new Date().toISOString().slice(0, 10), notes: '' }
  paymentError.value = ''
  showPaymentModal.value = true
  if (employeeList.value.length === 0 && props.businessId) {
    const { data, error } = await supabase
      .from('profiles').select('id, full_name')
      .eq('business_id', props.businessId).eq('role', 'empleado').eq('active', true).order('full_name')
    if (!error) employeeList.value = (data ?? []).map((p: any) => ({ id: p.id, name: p.full_name }))
  }
}

const closePaymentModal = () => { showPaymentModal.value = false; paymentError.value = '' }

const handleSavePayment = async () => {
  if (!props.businessId) return
  if (!paymentForm.value.employeeId) { paymentError.value = 'Selecciona un empleado'; return }
  if (paymentForm.value.amount <= 0) { paymentError.value = 'El monto debe ser mayor a 0'; return }
  savingPayment.value = true
  paymentError.value = ''
  try {
    await createEmployeePayment(props.businessId, paymentForm.value.employeeId, paymentForm.value.amount, paymentForm.value.method, paymentForm.value.notes, paymentForm.value.date)
    success('Pago registrado correctamente')
    closePaymentModal()
    emit('saved')
  } catch (err) {
    paymentError.value = err instanceof Error ? err.message : 'Error al registrar el pago'
  } finally {
    savingPayment.value = false
  }
}

const formatMethod = (method: string) => {
  switch (method) {
    case 'cash': return 'Efectivo'
    case 'card': return 'Tarjeta'
    case 'transfer': return 'Transferencia'
    case 'zelle': return 'Zelle'
    case 'pago_movil': return 'Pago Móvil'
    case 'mixed': return 'Mixto'
    default: return method
  }
}
</script>
