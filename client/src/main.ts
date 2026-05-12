import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import './style.css'
import App from './App.vue'
import router from './router'
import { registerSW } from 'virtual:pwa-register'
import { queryClient } from './queryClient'
import { useThemeStore } from './store/theme'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Inicializar tema antes de montar la app para evitar flash de tema incorrecto
const themeStore = useThemeStore()
themeStore.initialize()

app.use(VueQueryPlugin, { queryClient })
app.use(router)
app.mount('#app')

try {
  registerSW({
    onRegistered(r: { update: () => unknown } | undefined) {
      if (r) {
        setInterval(() => r.update(), 60 * 60 * 1000)
      }
    },
  })
} catch {
  // En entornos sin el plugin PWA virtual, ignorar silenciosamente.
}
