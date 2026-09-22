import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { ASSIGNEES, assigneeBySlug } from '../_shared/assignees.ts'

const OFFICE_EMAIL = 'birojs@ervitex.lv'

const page = (title: string, body: string, ok = true) =>
  new Response(
    `<!doctype html><html lang="lv"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;font-family:Arial,sans-serif;background:#f5f5f5;color:#111">
<div style="max-width:520px;margin:12vh auto;background:#fff;padding:32px;border-top:4px solid ${ok ? '#E11D2E' : '#999'}">
<h1 style="font-size:20px;margin:0 0 10px">${title}</h1><p style="font-size:15px;color:#444;margin:0">${body}</p>
</div></body></html>`,
    { status: ok ? 200 : 400, headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' } },
  )

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const url = new URL(req.url)
  const token = (url.searchParams.get('token') || '').trim()
  const action = (url.searchParams.get('action') || '').trim()

  if (!/^[a-f0-9]{36}$/.test(token) || !/^(assign:[a-z]+|complete)$/.test(action)) {
    return page('Saite nav derīga', 'Pārbaudi, vai saite nokopēta pilnībā.', false)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: quote } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('action_token', token)
    .maybeSingle()

  if (!quote) return page('Pieprasījums nav atrasts', 'Iespējams, tas ir dzēsts.', false)

  if (action === 'complete') {
    await supabase
      .from('quote_requests')
      .update({ status: 'closed', completed_at: new Date().toISOString(), worksheet_locked: true })
      .eq('id', quote.id)
    return page('Pabeigts', 'Pieprasījums atzīmēts kā pabeigts. Vari aizvērt šo logu.')
  }

  const slug = action.split(':')[1]
  const person = assigneeBySlug(slug)
  if (!person) return page('Nezināma persona', 'Šo saiti vairs neizmanto.', false)

  await supabase
    .from('quote_requests')
    .update({
      assigned_pm_slug: person.slug,
      assigned_pm_name: person.name,
      assigned_pm_email: person.email,
      assigned_at: new Date().toISOString(),
      status: quote.status === 'new' ? 'contacted' : quote.status,
    })
    .eq('id', quote.id)

  // 30-day signed links for attachments so the assignee can open them from e-mail.
  const files: string[] = []
  for (const entry of Array.isArray(quote.file_urls) ? quote.file_urls : []) {
    if (typeof entry !== 'string' || !entry) continue
    if (/^https?:\/\//i.test(entry)) { files.push(entry); continue }
    const { data: signed } = await supabase.storage
      .from('quote-attachments')
      .createSignedUrl(entry, 60 * 60 * 24 * 30)
    if (signed?.signedUrl) files.push(signed.signedUrl)
  }

  await supabase.functions.invoke('send-transactional-email', {
    body: {
      templateName: 'quote-assigned',
      recipientEmail: person.email,
      replyTo: quote.email,
      idempotencyKey: `quote-${quote.id}-assign-${person.slug}`,
      templateData: {
        ref: quote.ref,
        assigneeName: person.name,
        name: quote.name,
        email: quote.email,
        phone: quote.phone || '',
        company: quote.company || '',
        message: quote.message || '',
        files,
        print_method: quote.print_method || '',
        print_placement: quote.print_placement || '',
        print_colors: quote.print_colors || '',
        deadline: quote.deadline || '',
        worksheetUrl: `https://raimxlv.github.io/ervitex/saraksts/${token}`,
      },
    },
  })

  return page(
    `Nodots ${person.name}`,
    `${person.name} tikko saņēma pieprasījumu uz ${person.email}. Vari aizvērt šo logu.`,
  )
})

export const _assignees = ASSIGNEES
