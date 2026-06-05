<template>
  <div class="rounded-xl border border-border bg-surface p-4">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h3 class="text-base font-semibold text-text">Gastos del Mes</h3>
        <p class="text-sm text-text-muted">Egresos fijos y variables</p>
      </div>
      <button @click="openNew" class="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-text-inverse transition-theme hover:bg-primary-hover">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span class="hidden sm:inline">Registrar gasto</span>
      </button>
    </div>
    <div class="lg:hidden space-y-2 mb-3">
      <div v-for="expense in visibleExpenses" :key="expense.id" class="rounded-lg border border-border-subtle bg-bg-secondary p-3">
        <div class="flex items-start justify-between mb-1.5">
          <div>
            <div class="text-xs text-text-muted">{{ expense.date }}</div>
            <div class="font-medium text-text text-sm">{{ expense.name }}</div>
          </div>
          <span :class="[
            'rounded-full px-2 py-0.5 text-xs shrink-0',
            expense.category === 'Fijos' ? 'bg-info/10 text-info' :
            expense.category === 'Insumos' ? 'bg-warning/10 text-warning' :
            'bg-primary/10 text-primary'
          ]">{{ expense.category }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-medium text-text">{{ formatUSD(expense.amount) }}</span>
          <button @click="openEdit(expense)" class="rounded-lg p-1.5 text-text-muted transition-theme hover:bg-bg-secondary hover:text-primary" title="Editar gasto">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div class="overflow-x-auto hidden lg:block">
      <table class="w-full">
        <thead>
          <tr class="border-b border-border-subtle">
            <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Fecha</th>
            <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Concepto</th>
            <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Categoría</th>
            <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Monto</th>
            <th class="pb-3 text-center text-xs font-semibold uppercase text-text-muted">Acción</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-subtle">
          <tr v-for="expense in visibleExpenses" :key="expense.id" class="text-sm transition-theme hover:bg-bg-secondary/50">
            <td class="py-3 text-text-secondary">{{ expense.date }}</td>
            <td class="py-3 font-medium text-text">{{ expense.name }}</td>
            <td class="py-3">
              <span :class="[
                'rounded-full px-2 py-0.5 text-xs',
                expense.category === 'Fijos' ? 'bg-info/10 text-info' :
                expense.category === 'Insumos' ? 'bg-warning/10 text-warning' :
                'bg-primary/10 text-primary'
              ]">{{ expense.category }}</span>
            </td>
            <td class="py-3 text-right font-medium text-text">{{ formatUSD(expense.amount) }}</td>
            <td class="py-3 text-center">
              <button @click="openEdit(expense)" class="rounded-lg p-1.5 text-text-muted transition-theme hover:bg-bg-secondary hover:text-primary" title="Editar gasto">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="canViewAllExpenses" class="mt-3 flex justify-center">
      <button
        type="button"
        class="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-primary transition-theme hover:bg-bg-secondary"
        @click="emit('view-all')"
      >
        Ver todos
      </button>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="close"
    >
      <div class="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <div class="mb-4">
          <h2 class="text-lg font-semibold text-text">{{ editingId ? 'Editar gasto' : 'Registrar gasto' }}</h2>
          <p class="text-sm text-text-muted">{{ editingId ? 'Modifica los datos del egreso' : 'Agrega un egreso al negocio' }}</p>
        </div>
        <form class="space-y-4" @submit.prevent="handleSave">
          <div>
            <label class="mb-1 block text-sm font-medium text-text" for="exp-name">Concepto</label>
            <input id="exp-name" v-model="form.name" type="text"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="Ej: Renta del local" required />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1 block text-sm font-medium text-text" for="exp-category">Categoría</label>
              <select id="exp-category" v-model="form.category"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30">
                <option value="Fijos">Fijos</option>
                <option value="Insumos">Insumos</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-text" for="exp-amount">Monto ($)</label>
              <input id="exp-amount" v-model.number="form.amount" type="number" min="0" step="0.01"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="0.00" required />
            </div>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-text" for="exp-date">Fecha</label>
            <input id="exp-date" v-model="form.date" type="date"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30" required />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-text" for="exp-notes">Notas</label>
            <textarea id="exp-notes" v-model="form.notes" rows="2"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="Opcional" />
          </div>
          <p v-if="saveError" class="text-sm text-danger">{{ saveError }}</p>
          <div class="flex items-center justify-end gap-3">
            <button type="button"
              class="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition-theme hover:bg-bg-secondary"
              @click="close">Cancelar</button>
            <button type="submit" :disabled="isPending"
              class="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-text-inverse shadow-sm transition-theme hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">
              {{ isPending ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCurrency } from '../../composables/useCurrency'
import { useNotification } from '../../composables/useNotification'
import { saveExpense, type ExpenseRow, type ExpenseFormData } from '../../services/expensesService'

const props = defineProps<{
  expenses: ExpenseRow[]
  businessId: string | null
}>()

const emit = defineEmits<{
  'saved': []
  'view-all': []
}>()

const { formatUSD } = useCurrency()
const { success } = useNotification()

const showModal = ref(false)
const editingId = ref<string | null>(null)
const isPending = ref(false)
const saveError = ref('')
const form = ref<ExpenseFormData>({
  name: '', category: 'General', amount: 0,
  date: new Date().toISOString().slice(0, 10), notes: '',
})

const resetForm = () => {
  form.value = { name: '', category: 'General', amount: 0, date: new Date().toISOString().slice(0, 10), notes: '' }
  editingId.value = null
  saveError.value = ''
}

const openNew = () => { resetForm(); showModal.value = true }
const openEdit = (expense: ExpenseRow) => {
  editingId.value = expense.id
  form.value = { name: expense.name, category: expense.category, amount: expense.amount, date: expense.date, notes: '' }
  showModal.value = true
}
const close = () => { showModal.value = false; resetForm() }

const visibleExpenses = computed(() => props.expenses.slice(0, 5))

const canViewAllExpenses = computed(() => props.expenses.length > 5)

const handleSave = async () => {
  if (!props.businessId) return
  isPending.value = true
  saveError.value = ''
  try {
    await saveExpense(props.businessId, { ...form.value, id: editingId.value ?? undefined })
    success('Gasto guardado correctamente')
    close()
    emit('saved')
  } catch (err) {
    saveError.value = err instanceof Error ? err.message : 'Error al guardar el gasto'
  } finally {
    isPending.value = false
  }
}
</script>
