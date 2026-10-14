import { createEmailWebhookHandler } from 'npm:@lovable.dev/email-js@0.3.1'
import { createClient } from 'npm:@supabase/supabase-js@2'

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

const STATUS = { bounce: 'bounced', complaint: 'complained', unsubscribe: 'suppressed' } as const
const MESSAGE = {
  bounce: 'Permanent bounce — email address is invalid or rejected',
  complaint: 'Spam complaint — recipient marked email as spam',
  unsubscribe: 'Recipient unsubscribed',
} as const

// Notification-only record of delivery outcomes; never gates sends.
async function record(reason: 'bounce' | 'complaint' | 'unsubscribe', eventId: string, recipient: string) {
  const email = recipient.toLowerCase()
  const { error: supErr } = await db
    .from('suppressed_emails')
    .upsert({ email, reason, metadata: null }, { onConflict: 'email' })
  if (supErr) {
    console.error('suppressed_emails upsert failed', { code: supErr.code, message: supErr.message, event_id: eventId })
    throw new Error('suppressed_emails upsert failed')
  }
  const { error: logErr } = await db.from('email_send_log').insert({
    message_id: null,
    template_name: 'system',
    recipient_email: email,
    status: STATUS[reason],
    error_message: MESSAGE[reason],
    metadata: null,
  })
  if (logErr) {
    console.error('email_send_log insert failed', { code: logErr.code, message: logErr.message, event_id: eventId })
    throw new Error('email_send_log insert failed')
  }
}

const handler = createEmailWebhookHandler({
  apiKey: Deno.env.get('LOVABLE_API_KEY')!,
  on: {
    'email.bounced': async (event) => record('bounce', event.event_id, event.data.recipient),
    'email.complaint': async (event) => record('complaint', event.event_id, event.data.recipient),
    'email.unsubscribed': async (event) => record('unsubscribe', event.event_id, event.data.recipient),
  },
})

Deno.serve((req) => handler(req))
