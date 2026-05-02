import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './store/auth'
import { registerSW } from 'virtual:pwa-register'
import { queryClient } from './queryClient'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(VueQueryPlugin, { queryClient })

const authStore = useAuthStore(pinia)
authStore.hydrate()

app.use(router)
app.mount('#app')

// Registrar Service Worker para actualizaciones automáticas
try {
	registerSW({
		onRegistered(r: any) {
			if (r) {
				// reintentar update cada hora
				setInterval(() => r.update(), 60 * 60 * 1000)
			}
		}
	})
} catch (e) {
	// en entornos donde no existe el plugin virtual, ignorar
}
