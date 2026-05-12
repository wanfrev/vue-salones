import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../store/auth'
import router from '../router'

export const useAuth = () => {
  const authStore = useAuthStore()
  const { loading: storeLoading } = storeToRefs(authStore)
  const errorMessage = ref('')
  const loading = computed(() => storeLoading.value)

  const login = async (_email: string, _password: string) => {
    errorMessage.value = ''
    // MOCK LOGIN: Siempre permite entrar sin validar credenciales.
    return true
  }

  const logout = async () => {
    await authStore.signOut()
    router.replace('/')
  }

  return {
    loading,
    errorMessage,
    login,
    logout,
    authStore,
  }
}
