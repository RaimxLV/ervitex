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
import { safeAttachmentName } from '../request-safety.ts'

interface Props {
  ref?: string
  worksheetUrl?: string
  name?: string
  email?: string
  phone?: string
  company?: string
  billing?: string[]
  message?: string
  files?: string[]
  fileCount?: number
  print_method?: string
  print_placement?: string
  print_colors?: string
  deadline?: string
  submittedAt?: string
  pmName?: string
  pmEmail?: string
}

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', color: '#111' }
const container = { maxWidth: '640px', margin: '0 auto', padding: '22px' }
const header = { borderBottom: '1px solid #111', paddingBottom: '12px', marginBottom: '18px' }
const h1 = { fontSize: '20px', margin: '0', letterSpacing: '0.4px', color: '#111' }
const h3 = { fontSize: '13px', margin: '18px 0 8px', color: '#111' }
const subtle = { color: '#666', fontSize: '12px', margin: '4px 0 0' }
const label = { color: '#666', paddingRight: '12px' as const, paddingBottom: '5px' }
const value = { paddingBottom: '5px' }
const worksheetLink = {
  display: 'inline-block',
  color: '#991b2f',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  lineHeight: '22px',
  textDecoration: 'underline',
  textDecorationThickness: '2px',
  textUnderlineOffset: '4px',
}
const noteBox = { whiteSpace: 'pre-line' as const, fontSize: '13px', background: '#f6f6f6', padding: '10px', borderRadius: '3px' }
const requestSummary = { borderTop: '3px solid #991b2f', borderBottom: '1px solid #991b2f', backgroundColor: '#faf3f4', padding: '14px', marginBottom: '18px' }
const statusText = { color: '#991b2f', fontSize: '15px', fontWeight: 'bold' as const, margin: '0 0 8px', lineHeight: '22px' }

const QuoteRequestEmail = ({
  ref: _ref = '',
  worksheetUrl = '',
  name = '',
  email = '',
  phone = '',
  company = '',
  billing = [],
  message = '',
  files = [],
  fileCount,
  print_method = '',
  print_placement = '',
  print_colors = '',
  deadline = '',
  submittedAt = '',
  pmName = '',
  pmEmail = '',
}: Props) => {
  const hasPrint = !!(print_method || print_placement || print_colors || deadline)
  const printStatus = print_method === 'none' ? 'BEZ APDRUKAS' : print_method ? 'APDRUKA NEPIECIEŠAMA' : 'APDRUKA NAV NORĀDĪTA'
  const methodName = ({ consult: 'Nezinu / konsultēties', silkscreen: 'Sietspiede', dtf: 'DTF', termodruka: 'Termodruka', embroidery: 'Izšūšana', sublimation: 'Sublimācija', other: 'Cita', none: 'Bez apdrukas' } as Record<string, string>)[print_method] || print_method
  const attachedCount = fileCount ?? files.length

  return (
    <Html lang="lv">
      <Head />
      <Preview>{`Jauns pieprasījums no ${name || email || 'klienta'}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>JAUNS PIEPRASĪJUMS</Heading>
            {submittedAt ? <Text style={subtle}>{submittedAt}</Text> : null}
          </Section>

          <Section style={requestSummary}>
            <Text style={statusText}>{printStatus}</Text>
            <Text style={statusText}>PIEVIENOTI FAILI: {attachedCount}</Text>
            {files.map((u, i) => (
              <Text key={i} style={{ margin: '8px 0', fontSize: '14px', overflowWrap: 'anywhere' }}>
                <Link href={u} style={worksheetLink}>{safeAttachmentName(u, `Fails ${i + 1}`)} →</Link>
              </Text>
            ))}
          </Section>

          {pmName ? <Text style={subtle}>Projekta vadītāja: {pmName}{pmEmail ? ` · ${pmEmail}` : ''}</Text> : null}

          {worksheetUrl ? (
            <Section>
              <Link href={worksheetUrl} style={worksheetLink}>ATVĒRT PREČU SARAKSTU →</Link>
            </Section>
          ) : null}

          <Heading as="h3" style={h3}>Klients</Heading>
          <table style={{ fontSize: '14px' }}>
            <tbody>
              <tr><td style={label}>Vārds:</td><td style={value}><strong>{name}</strong></td></tr>
              <tr><td style={label}>E-pasts:</td><td style={value}><Link href={`mailto:${email}`}>{email}</Link></td></tr>
              {phone ? <tr><td style={label}>Tālrunis:</td><td style={value}>{phone}</td></tr> : null}
              {company ? <tr><td style={label}>Uzņēmums:</td><td style={value}>{company}</td></tr> : null}
              {billing.length ? <tr><td style={label}>Rekvizīti:</td><td style={value}>{billing.map((b, i) => <span key={i} style={{ display: 'block' }}>{b}</span>)}</td></tr> : null}
            </tbody>
          </table>

          {hasPrint ? (
            <>
              <Heading as="h3" style={h3}>Apdruka</Heading>
              <table style={{ fontSize: '13px' }}>
                <tbody>
                  {print_method ? <tr><td style={label}>Metode:</td><td style={value}>{methodName}</td></tr> : null}
                  {print_placement ? <tr><td style={label}>Vieta:</td><td style={value}>{print_placement}</td></tr> : null}
                  {print_colors ? <tr><td style={label}>Krāsas:</td><td style={value}>{print_colors}</td></tr> : null}
                  {deadline ? <tr><td style={label}>Termiņš:</td><td style={value}>{deadline}</td></tr> : null}
                </tbody>
              </table>
            </>
          ) : null}

          {message ? (
            <>
              <Heading as="h3" style={h3}>Piezīmes</Heading>
              <Text style={noteBox}>{message}</Text>
            </>
          ) : null}

          <Hr style={{ borderColor: '#eee', margin: '22px 0 0' }} />
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: QuoteRequestEmail,
  subject: (d: Props) => `Cenu pieprasījums — ${d.company || d.name || 'klients'}`,
  displayName: 'Cenu pieprasījums',
  previewData: {
    name: 'Jānis Bērziņš',
    email: 'janis@example.com',
    phone: '+371 20000000',
    company: 'SIA Piemērs',
    message: 'Lūdzu piedāvājumu ar apdruku.',
    files: [],
    submittedAt: new Date().toLocaleString('lv-LV'),
    worksheetUrl: 'https://example.com/saraksts/token',
  },
} satisfies TemplateEntry
