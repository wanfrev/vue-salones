import { computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useCurrency() {
  const { authStore } = useAuth()

  const exchangeRate = computed(() => authStore.business?.ves_exchange_rate ?? 1)
  const currency = computed(() => authStore.business?.currency ?? 'USD')

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatVES = (value: number) => {
    const vesValue = value * exchangeRate.value
    return `Bs ${new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(vesValue)}`
  }

  const formatDual = (value: number) => {
    return `${formatUSD(value)} / ${formatVES(value)}`
  }

  const formatVESInline = (usdValue: number) => {
    const vesValue = usdValue * exchangeRate.value
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(vesValue)
  }

  const setExchangeRate = async (rate: number) => {
    const businessId = authStore.businessId
    if (!businessId) return

    const { error } = await supabase
      .from('businesses')
      .update({ ves_exchange_rate: rate })
      .eq('id', businessId)

    if (error) throw error

    if (authStore.business) {
      authStore.business = { ...authStore.business, ves_exchange_rate: rate }
    }
  }

  const isAdmin = computed(() => {
    const role = authStore.profile?.role
    return role === 'admin' || role === 'superadmin'
  })

  return {
    exchangeRate,
    currency,
    formatUSD,
    formatVES,
    formatDual,
    formatVESInline,
    setExchangeRate,
    isAdmin,
  }
}
