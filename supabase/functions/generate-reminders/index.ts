import { serve } from 'https://deno.land/std@0.210.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const cronSecret = Deno.env.get('CRON_SECRET')

    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase config.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace('Bearer ', '').trim()

    if (cronSecret && token !== cronSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const now = new Date()
    const in23h = new Date(now.getTime() + 23 * 60 * 60 * 1000)
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000)

    const { data: appointments, error: apptError } = await supabaseAdmin
      .from('appointments')
      .select('*, clients(full_name, phone), services(name)')
      .is('reminder_sent_at', null)
      .eq('status', 'pending')
      .gte('start_time', in23h.toISOString())
      .lte('start_time', in25h.toISOString())

    if (apptError) {
      return new Response(JSON.stringify({ error: apptError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!appointments || appointments.length === 0) {
      return new Response(JSON.stringify({ generated: 0 }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let totalGenerated = 0
    const appointmentIds: string[] = []

    for (const appt of appointments) {
      const client = appt.clients as { full_name: string; phone: string } | null
      const service = appt.services as { name: string } | null
      if (!client || !service) continue

      const notifications = []

      notifications.push({
        business_id: appt.business_id,
        appointment_id: appt.id,
        profile_id: appt.employee_id,
        client_name: client.full_name,
        client_phone: client.phone,
        service_name: service.name,
        appointment_time: appt.start_time,
      })

      const { data: admins } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('business_id', appt.business_id)
        .eq('role', 'admin')
        .eq('active', true)

      if (admins) {
        for (const admin of admins) {
          if (admin.id !== appt.employee_id) {
            notifications.push({
              business_id: appt.business_id,
              appointment_id: appt.id,
              profile_id: admin.id,
              client_name: client.full_name,
              client_phone: client.phone,
              service_name: service.name,
              appointment_time: appt.start_time,
            })
          }
        }
      }

      const { error: insertError } = await supabaseAdmin
        .from('reminder_notifications')
        .insert(notifications)

      if (!insertError) {
        totalGenerated += notifications.length
        appointmentIds.push(appt.id)
      }
    }

    if (appointmentIds.length > 0) {
      await supabaseAdmin
        .from('appointments')
        .update({ reminder_sent_at: new Date().toISOString() })
        .in('id', appointmentIds)
    }

    return new Response(JSON.stringify({ generated: totalGenerated }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
