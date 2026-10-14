import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { sendAppEmail } from '../_shared/send-app-email.ts'

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return json(401, { error: 'Unauthorized' })

  let body: any
  try { body = await req.json() } catch { return json(400, { error: 'Invalid JSON' }) }
  const { offerId, recipientEmail, replyTo, idempotencyKey, templateData } = body ?? {}
  if (typeof offerId !== 'string' || typeof recipientEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    return json(400, { error: 'offerId and recipientEmail required' })
  }

  // Offers are readable only by staff (RLS) — reading it with the caller's token gates access.
  const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: auth } },
  })
  const { data: offer } = await userClient.from('pm_offers').select('id').eq('id', offerId).maybeSingle()
  if (!offer) return json(403, { error: 'Forbidden' })

  const result = await sendAppEmail('pm-offer', recipientEmail.trim(), {
    replyTo: typeof replyTo === 'string' ? replyTo : undefined,
    idempotencyKey: typeof idempotencyKey === 'string' ? idempotencyKey : undefined,
    templateData: templateData && typeof templateData === 'object' ? templateData : {},
  })
  if (!result.ok && result.reason === 'failed') return json(500, { error: result.error || 'Failed to send' })
  return json(200, { success: result.ok, reason: result.ok ? undefined : result.reason })
})
