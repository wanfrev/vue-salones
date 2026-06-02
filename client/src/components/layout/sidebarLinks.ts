import {
  CalendarDays,
  Clock,
  DollarSign,
  Receipt,
  Users,
  BarChart3,
  Briefcase,
  Sparkles,
  Package,
  Archive,
  ShoppingCart,
  Settings,
} from 'lucide-vue-next'
import type { Component } from 'vue'

export interface SidebarLink {
  to: string
  label: string
  labelKey?: string
  icon: Component
  adminOnly?: boolean
  employeeOnly?: boolean
  badge?: string
}

export interface SidebarSection {
  title?: string
  adminOnly?: boolean
  links: SidebarLink[]
}

export const sidebarSections: SidebarSection[] = [
  {
    links: [
      { to: '/admin', label: 'Agenda', icon: CalendarDays, adminOnly: true },
      { to: '/dashboard/agenda', label: 'Agenda', icon: CalendarDays, employeeOnly: true },
      { to: '/dashboard/historial', label: 'Historial', icon: Clock, employeeOnly: true },
      { to: '/dashboard/comisiones', label: 'Comisiones', icon: DollarSign, employeeOnly: true },
      { to: '/dashboard/recibo', label: 'Recibo', icon: Receipt, employeeOnly: true },
      { to: '/clientes', label: 'Clientes', labelKey: 'client', icon: Users, adminOnly: true },
      { to: '/finanzas', label: 'Finanzas', icon: BarChart3, adminOnly: true, badge: 'Nuevo' },
      { to: '/equipo', label: 'Equipo', labelKey: 'employee', icon: Briefcase, adminOnly: true },
      { to: '/servicios', label: 'Servicios', labelKey: 'service', icon: Sparkles, adminOnly: true },
      { to: '/productos', label: 'Productos', icon: Package, adminOnly: true },
      { to: '/inventario', label: 'Inventario', icon: Archive, adminOnly: true },
    ],
  },
  {
    title: 'Ventas',
    adminOnly: true,
    links: [
      { to: '/pos', label: 'Punto de Venta', icon: ShoppingCart, adminOnly: true, badge: 'Nuevo' },
    ],
  },
  {
    title: 'Configuración',
    adminOnly: true,
    links: [
      { to: '/ajustes', label: 'Ajustes', icon: Settings, adminOnly: true },
    ],
  },
]
