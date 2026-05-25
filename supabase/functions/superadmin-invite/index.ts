import { serve } from 'https://deno.land/std@0.210.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const slugify = (value: string) => {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || `biz-${Date.now()}`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase config.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace('Bearer', '').trim()
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid session.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single()

    if (profileError || callerProfile?.role !== 'superadmin') {
      return new Response(JSON.stringify({ error: 'Forbidden.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const action = body.action || 'create'

    // ─── CREATE BUSINESS ──────────────────────────────────────
    if (action === 'create') {
      const businessName = String(body.businessName || '').trim()
      const ownerEmail = String(body.ownerEmail || '').trim()
      const ownerPassword = String(body.ownerPassword || '').trim()
      const nicheType = String(body.nicheType || 'salon').trim()

      if (!businessName || !ownerEmail || !ownerPassword) {
        return new Response(JSON.stringify({ error: 'businessName, ownerEmail, and ownerPassword are required.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const baseSlug = slugify(businessName)
      let slug = baseSlug
      let suffix = 1
      while (true) {
        const { data: existing } = await supabaseAdmin
          .from('businesses')
          .select('id')
          .eq('slug', slug)
          .maybeSingle()

        if (!existing) break
        suffix += 1
        slug = `${baseSlug}-${suffix}`
      }

      const { data: business, error: businessError } = await supabaseAdmin
        .from('businesses')
        .insert({
          name: businessName,
          slug,
          niche_type: nicheType || 'salon',
        })
        .select('*')
        .single()

      if (businessError || !business) {
        return new Response(JSON.stringify({ error: businessError?.message || 'Unable to create business.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: ownerData, error: ownerError } = await supabaseAdmin.auth.admin.createUser({
        email: ownerEmail,
        password: ownerPassword,
        email_confirm: true,
        user_metadata: {
          full_name: `Admin ${businessName}`,
          business_id: business.id,
          role: 'admin',
        },
      })

      if (ownerError || !ownerData?.user?.id) {
        await supabaseAdmin.from('businesses').delete().eq('id', business.id)
        return new Response(JSON.stringify({ error: ownerError?.message || 'Unable to create user.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ business, invitedUserId: ownerData.user.id }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── DELETE BUSINESS ──────────────────────────────────────
    if (action === 'delete_business') {
      const businessId = String(body.business_id || '').trim()

      if (!businessId) {
        return new Response(JSON.stringify({ error: 'business_id is required.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Delete in dependency order (respects FK RESTRICT constraints)
      const tables = [
        'inventory_movements',
        'inventory_stock',
        'products',
        'product_categories',
        'inventory_locations',
        'transactions',
        'appointments',
        'employee_absences',
        'expenses',
        'clients',
        'service_variants',
        'services',
        'service_categories',
      ]

      for (const table of tables) {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('business_id', businessId)

        if (error) {
          return new Response(JSON.stringify({ error: `Error deleting ${table}: ${error.message}` }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      }

      // Get profile IDs (needed to clean up auth.users)
      const { data: profilesToDelete } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('business_id', businessId)

      // Delete profiles
      await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('business_id', businessId)

      // Delete the business (cascades to remaining profiles)
      const { error: bizError } = await supabaseAdmin
        .from('businesses')
        .delete()
        .eq('id', businessId)

      if (bizError) {
        return new Response(JSON.stringify({ error: bizError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Clean up orphaned auth.users
      if (profilesToDelete) {
        for (const p of profilesToDelete) {
          await supabaseAdmin.auth.admin.deleteUser(p.id)
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
