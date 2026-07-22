/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface QuoteItem {
  name?: string
  code?: string
  brand?: string
  colorName?: string
  size?: string
  qty?: number | string
}

interface Props {
  name?: string
  email?: string
  phone?: string
  company?: string
  message?: string
  items?: QuoteItem[]
  files?: string[]
  print_method?: string
  print_placement?: string
  print_colors?: string
  deadline?: string
  submittedAt?: string
}

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', color: '#111' }
const container = { maxWidth: '680px', margin: '0 auto', padding: '20px' }
const headerBar = { borderBottom: '3px solid #E11D2E', paddingBottom: '12px', marginBottom: '16px' }
const h1 = { fontSize: '20px', margin: '0', letterSpacing: '0.5px', color: '#111' }
const subtle = { color: '#666', fontSize: '12px', margin: '4px 0 0' }
const h3 = { fontSize: '14px', margin: '20px 0 6px', color: '#111' }
const label = { color: '#666', paddingRight: '12px' as const }
const rowCell = { padding: '8px', borderBottom: '1px solid #eee', fontSize: '13px' as const }
const th = { padding: '8px', textAlign: 'left' as const, fontSize: '12px', color: '#fff', background: '#111' }

const QuoteRequestEmail = ({
  name = '',
  email = '',
  phone = '',
  company = '',
  message = '',
  items = [],
  files = [],
  print_method = '',
  print_placement = '',
  print_colors = '',
  deadline = '',
  submittedAt = '',
}: Props) => {
  const totalQty = items.reduce((s, it) => s + (Number(it.qty) || 0), 0)
  const hasPrint = !!(print_method || print_placement || print_colors || deadline)

  return (
    <Html lang="lv">
      <Head />
      <Preview>{`Jauns pieprasījums no ${name || email || 'klienta'}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerBar}>
            <Heading style={h1}>JAUNS PIEPRASĪJUMS</Heading>
            <Text style={subtle}>ervitex.lv{submittedAt ? ` · ${submittedAt}` : ''}</Text>
          </Section>

          <Heading as="h3" style={h3}>Klients</Heading>
          <table style={{ fontSize: '14px' }}>
            <tbody>
              <tr><td style={label}>Vārds:</td><td><strong>{name}</strong></td></tr>
              <tr><td style={label}>E-pasts:</td><td><Link href={`mailto:${email}`}>{email}</Link></td></tr>
              {phone ? <tr><td style={label}>Tālrunis:</td><td>{phone}</td></tr> : null}
              {company ? <tr><td style={label}>Uzņēmums:</td><td>{company}</td></tr> : null}
            </tbody>
          </table>

          <Heading as="h3" style={h3}>{`Preces (${totalQty} gab.)`}</Heading>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Prece</th>
                <th style={th}>Krāsa</th>
                <th style={th}>Izmērs</th>
                <th style={{ ...th, textAlign: 'right' as const }}>Skaits</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td style={rowCell}>
                    <strong>{it.name || '-'}</strong>
                    <br />
                    <span style={{ color: '#666', fontSize: '12px' }}>{[it.code, it.brand].filter(Boolean).join(' · ')}</span>
                  </td>
                  <td style={rowCell}>{it.colorName || '-'}</td>
                  <td style={rowCell}>{it.size || '-'}</td>
                  <td style={{ ...rowCell, textAlign: 'right' as const, fontWeight: 'bold' }}>{it.qty ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {hasPrint ? (
            <>
              <Heading as="h3" style={h3}>Apdrukas informācija</Heading>
              <table style={{ fontSize: '13px' }}>
                <tbody>
                  {print_method ? <tr><td style={label}>Metode:</td><td>{print_method}</td></tr> : null}
                  {print_placement ? <tr><td style={label}>Izvietojums:</td><td>{print_placement}</td></tr> : null}
                  {print_colors ? <tr><td style={label}>Krāsu skaits:</td><td>{print_colors}</td></tr> : null}
                  {deadline ? <tr><td style={label}>Termiņš:</td><td>{deadline}</td></tr> : null}
                </tbody>
              </table>
            </>
          ) : null}

          {message ? (
            <>
              <Heading as="h3" style={h3}>Piezīmes</Heading>
              <Text style={{ whiteSpace: 'pre-line', fontSize: '13px', background: '#f7f7f7', padding: '10px', borderRadius: '4px' }}>{message}</Text>
            </>
          ) : null}

          {files.length > 0 ? (
            <>
              <Heading as="h3" style={h3}>Pievienotie faili</Heading>
              <ul style={{ paddingLeft: '18px', fontSize: '13px' }}>
                {files.map((u, i) => (
                  <li key={i}><Link href={u}>{(u.split('?')[0] || u).split('/').pop() || u}</Link></li>
                ))}
              </ul>
            </>
          ) : null}

          <Hr style={{ borderColor: '#eee', margin: '24px 0 12px' }} />
          <Text style={{ fontSize: '11px', color: '#999' }}>
            Šis pieprasījums saglabāts arī Ervitex administrācijas panelī. Atbildi klientam tieši uz {email}.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: QuoteRequestEmail,
  subject: (d: Props) => `[Ervitex pieprasījums] ${d.name || ''}${d.company ? ' · ' + d.company : ''}`,
  displayName: 'Cenu pieprasījums',
  previewData: {
    name: 'Jānis Bērziņš',
    email: 'janis@example.com',
    phone: '+371 20000000',
    company: 'SIA Piemērs',
    message: 'Lūdzu piedāvājumu ar apdruku.',
    items: [{ name: 'T-krekls', code: 'STTU755', brand: 'Stanley/Stella', colorName: 'Black', size: 'M', qty: 10 }],
    files: [],
    submittedAt: new Date().toLocaleString('lv-LV'),
  },
} satisfies TemplateEntry
