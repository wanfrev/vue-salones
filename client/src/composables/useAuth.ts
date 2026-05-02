import { computed, ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { loginRequest } from '../api/auth'
import { useAuthStore } from '../store/auth'
import router from '../router'
import type { LoginCredentials } from '../types/auth'

const resolveLoginErrorMessage = (error: unknown): string => {
  void error

  return 'Invalid credentials or server unavailable.'
}

export const useAuth = () => {
  const authStore = useAuthStore()
  const errorMessage = ref('')
  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (session) => {
      authStore.setSession(session)
    },
  })
  const loading = computed(() => loginMutation.isPending.value)

  const login = async (credentials: LoginCredentials) => {
    errorMessage.value = ''

    try {
      await loginMutation.mutateAsync(credentials)
      return true
    } catch (error) {
      errorMessage.value = resolveLoginErrorMessage(error)
      return false
    }
  }

  const logout = () => {
    authStore.clearSession()
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
