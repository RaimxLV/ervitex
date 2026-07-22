/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
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

const QuoteConfirmationEmail = ({
  name = '',
  phone = '',
  company = '',
  message = '',
  items = [],
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
      <Preview>Paldies! Tavs pieprasījums ir saņemts.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerBar}>
            <Heading style={h1}>PALDIES PAR PIEPRASĪJUMU!</Heading>
            <Text style={subtle}>ervitex.lv{submittedAt ? ` · ${submittedAt}` : ''}</Text>
          </Section>

          <Text style={{ fontSize: '14px' }}>
            Sveiki{name ? `, ${name}` : ''}!
          </Text>
          <Text style={{ fontSize: '14px' }}>
            Esam saņēmuši Tavu pieprasījumu un sazināsimies ar Tevi tuvākajā laikā ar piedāvājumu.
            Zemāk atradīsi Tava pieprasījuma kopsavilkumu.
          </Text>

          <Heading as="h3" style={h3}>Kontaktinformācija</Heading>
          <table style={{ fontSize: '14px' }}>
            <tbody>
              {name ? <tr><td style={label}>Vārds:</td><td><strong>{name}</strong></td></tr> : null}
              {phone ? <tr><td style={label}>Tālrunis:</td><td>{phone}</td></tr> : null}
              {company ? <tr><td style={label}>Uzņēmums:</td><td>{company}</td></tr> : null}
            </tbody>
          </table>

          <Heading as="h3" style={h3}>{`Pieprasītās preces (${totalQty} gab.)`}</Heading>
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
              <Heading as="h3" style={h3}>Tavas piezīmes</Heading>
              <Text style={{ whiteSpace: 'pre-line', fontSize: '13px', background: '#f7f7f7', padding: '10px', borderRadius: '4px' }}>{message}</Text>
            </>
          ) : null}

          <Hr style={{ borderColor: '#eee', margin: '24px 0 12px' }} />
          <Text style={{ fontSize: '12px', color: '#666' }}>
            Ja Tev ir papildu jautājumi, raksti mums uz <a href="mailto:birojs@ervitex.lv">birojs@ervitex.lv</a> vai zvani +371 67436899.
          </Text>
          <Text style={{ fontSize: '11px', color: '#999' }}>
            Ervitex — apģērbu un apdrukas partneris.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: QuoteConfirmationEmail,
  subject: () => `Paldies! Tavs pieprasījums ir saņemts — Ervitex`,
  displayName: 'Pieprasījuma apstiprinājums',
  previewData: {
    name: 'Jānis Bērziņš',
    company: 'SIA Piemērs',
    items: [{ name: 'T-krekls', code: 'STTU755', brand: 'Stanley/Stella', colorName: 'Black', size: 'M', qty: 10 }],
    submittedAt: new Date().toLocaleString('lv-LV'),
  },
} satisfies TemplateEntry
