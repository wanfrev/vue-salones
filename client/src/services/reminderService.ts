import { supabase } from '../lib/supabase'
import { mutate } from '../lib/typedSupabase'

export interface ReminderNotification {
  id: string
  business_id: string
  appointment_id: string
  profile_id: string
  client_name: string
  client_phone: string
  service_name: string
  appointment_time: string
  was_sent: boolean
  dismissed_at: string | null
  created_at: string
}

export const reminderKeys = {
  pending: (profileId?: string | null) => ['reminders', profileId] as const,
}

export const listPendingReminders = async (profileId: string): Promise<ReminderNotification[]> => {
  const { data, error } = await supabase
    .from('reminder_notifications')
    .select('*')
    .eq('profile_id', profileId)
    .eq('was_sent', false)
    .is('dismissed_at', null)
    .order('appointment_time', { ascending: true })

  if (error) throw error
  return data as ReminderNotification[]
}

export const markReminderAsSent = async (id: string): Promise<void> => {
  const { error } = await mutate
    .from('reminder_notifications')
    .update({ was_sent: true })
    .eq('id', id)

  if (error) throw error
}

export const dismissReminder = async (id: string): Promise<void> => {
  const { error } = await mutate
    .from('reminder_notifications')
    .update({ dismissed_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}
