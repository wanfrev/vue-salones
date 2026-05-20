import { serve } from 'https://deno.land/std@0.210.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const isHex = (value: string) => /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value)

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

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid session.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single()

    if (profileError || profile?.role !== 'superadmin') {
      return new Response(JSON.stringify({ error: 'Forbidden.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const businessName = String(body.businessName || '').trim()
    const ownerEmail = String(body.ownerEmail || '').trim()
    const primaryColor = String(body.primaryColor || '').trim()
    const secondaryColor = String(body.secondaryColor || '').trim()
    const nicheType = String(body.nicheType || 'salon').trim()

    if (!businessName || !ownerEmail) {
      return new Response(JSON.stringify({ error: 'businessName and ownerEmail are required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!isHex(primaryColor) || !isHex(secondaryColor)) {
      return new Response(JSON.stringify({ error: 'Invalid color hex values.' }), {
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
        theme_config: {
          primary: primaryColor,
          secondary: secondaryColor,
        },
      })
      .select('*')
      .single()

    if (businessError || !business) {
      return new Response(JSON.stringify({ error: businessError?.message || 'Unable to create business.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      ownerEmail,
      {
        data: { full_name: `Admin ${businessName}` },
      }
    )

    if (inviteError || !inviteData?.user?.id) {
      await supabaseAdmin.from('businesses').delete().eq('id', business.id)
      return new Response(JSON.stringify({ error: inviteError?.message || 'Unable to invite user.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const invitedUserId = inviteData.user.id

    const { error: profileInsertError } = await supabaseAdmin.from('profiles').insert({
      id: invitedUserId,
      business_id: business.id,
      full_name: inviteData.user.user_metadata?.full_name || `Admin ${businessName}`,
      role: 'admin',
    })

    if (profileInsertError) {
      await supabaseAdmin.auth.admin.deleteUser(invitedUserId)
      await supabaseAdmin.from('businesses').delete().eq('id', business.id)
      return new Response(JSON.stringify({ error: profileInsertError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ business, invitedUserId }), {
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
