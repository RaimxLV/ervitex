import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { EmailAPIError, sendLovableEmail } from 'npm:@lovable.dev/email-js@0.3.1'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { TEMPLATES } from './transactional-email-templates/registry.ts'

// Server-only direct sender: keeps the per-send From name/address and Reply-To
// behaviour (sender shown as the customer / project manager).
const SITE_NAME = 'ervitex'
const SENDER_DOMAIN = 'notify.ervitex.lv'
const FROM_DOMAIN = 'ervitex.lv'

export interface AppEmailOptions {
  templateData?: Record<string, any>
  idempotencyKey?: string
  replyTo?: string
  fromEmail?: string
  fromName?: string
}

export type AppEmailResult = { ok: true } | { ok: false; reason: 'recipient_suppressed' | 'failed'; error?: string }

export async function sendAppEmail(templateName: string, to: string, opts: AppEmailOptions = {}): Promise<AppEmailResult> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY')
  const template = TEMPLATES[templateName]
  if (!apiKey || !template) return { ok: false, reason: 'failed', error: !apiKey ? 'LOVABLE_API_KEY missing' : 'template not found' }
  const recipient = template.to || to
  if (!recipient) return { ok: false, reason: 'failed', error: 'recipient required' }

  const fromEmail = typeof opts.fromEmail === 'string' && /^[a-z0-9._-]+@ervitex\.lv$/i.test(opts.fromEmail.trim())
    ? opts.fromEmail.trim().toLowerCase() : undefined
  const fromName = typeof opts.fromName === 'string'
    ? opts.fromName.replace(/[<>"\r\n,;@]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60) || undefined : undefined
  const from = `${fromName ? (fromEmail ? `${fromName} | ${SITE_NAME}` : `${fromName} (via ${SITE_NAME})`) : SITE_NAME} <${fromEmail || `noreply@${FROM_DOMAIN}`}>`

  const data = opts.templateData ?? {}
  const element = React.createElement(template.component, data)
  const html = await renderAsync(element)
  const text = await renderAsync(element, { plainText: true })
  const subject = typeof template.subject === 'function' ? template.subject(data) : template.subject

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const log = async (status: 'sent' | 'suppressed' | 'failed', error_message?: string) => {
    const { error } = await db.from('email_send_log').insert({
      message_id: null, template_name: templateName, recipient_email: recipient, status, error_message,
    })
    if (error) console.error('email_send_log insert failed', { code: error.code, message: error.message })
  }

  try {
    await sendLovableEmail(
      {
        to: recipient, from, sender_domain: SENDER_DOMAIN, subject, html, text,
        purpose: 'transactional', label: templateName,
        idempotency_key: opts.idempotencyKey || crypto.randomUUID(),
        reply_to: opts.replyTo,
      },
      { apiKey, sendUrl: Deno.env.get('LOVABLE_SEND_URL') },
    )
  } catch (e) {
    if (e instanceof EmailAPIError && e.code === 'recipient_suppressed') {
      await log('suppressed')
      return { ok: false, reason: 'recipient_suppressed' }
    }
    const msg = e instanceof Error ? e.message : String(e)
    await log('failed', msg)
    return { ok: false, reason: 'failed', error: msg }
  }
  await log('sent')
  return { ok: true }
}
