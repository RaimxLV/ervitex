/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
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

interface Props {
  ref?: string
  assigneeName?: string
  name?: string
  email?: string
  phone?: string
  company?: string
  message?: string
  files?: string[]
  print_method?: string
  print_placement?: string
  print_colors?: string
  deadline?: string
  worksheetUrl?: string
}

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', color: '#111' }
const container = { maxWidth: '640px', margin: '0 auto', padding: '22px' }
const header = { borderBottom: '1px solid #111', paddingBottom: '12px', marginBottom: '18px' }
const h1 = { fontSize: '20px', margin: '0', letterSpacing: '0.4px', color: '#111' }
const h3 = { fontSize: '13px', margin: '18px 0 8px', color: '#111' }
const label = { color: '#666', paddingRight: '12px' as const, paddingBottom: '5px' }
const value = { paddingBottom: '5px' }
const cta = {
  display: 'inline-block',
  background: '#111',
  color: '#fff',
  fontSize: '13px',
  fontWeight: 'bold' as const,
  padding: '12px 18px',
  borderRadius: '3px',
  textDecoration: 'none',
}
const noteBox = { whiteSpace: 'pre-line' as const, fontSize: '13px', background: '#f6f6f6', padding: '10px', borderRadius: '3px' }

const QuoteAssignedEmail = ({
  assigneeName = '',
  name = '',
  email = '',
  phone = '',
  company = '',
  message = '',
  files = [],
  print_method = '',
  print_placement = '',
  print_colors = '',
  deadline = '',
  worksheetUrl = '',
}: Props) => {
  const hasPrint = !!(print_method || print_placement || print_colors || deadline)

  return (
    <Html lang="lv">
      <Head />
      <Preview>{`Pieprasījums nodots ${assigneeName || 'tev'}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>PIEPRASĪJUMS TEV</Heading>
          </Section>

          {worksheetUrl ? (
            <Section>
              <Button href={worksheetUrl} style={cta}>ATVĒRT PREČU SARAKSTU</Button>
            </Section>
          ) : null}

          <Heading as="h3" style={h3}>Klients</Heading>
          <table style={{ fontSize: '14px' }}>
            <tbody>
              <tr><td style={label}>Vārds:</td><td style={value}><strong>{name}</strong></td></tr>
              <tr><td style={label}>E-pasts:</td><td style={value}><Link href={`mailto:${email}`}>{email}</Link></td></tr>
              {phone ? <tr><td style={label}>Tālrunis:</td><td style={value}>{phone}</td></tr> : null}
              {company ? <tr><td style={label}>Uzņēmums:</td><td style={value}>{company}</td></tr> : null}
            </tbody>
          </table>

          {hasPrint ? (
            <>
              <Heading as="h3" style={h3}>Apdruka</Heading>
              <table style={{ fontSize: '13px' }}>
                <tbody>
                  {print_method ? <tr><td style={label}>Metode:</td><td style={value}>{print_method}</td></tr> : null}
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

          {files.length > 0 ? (
            <>
              <Heading as="h3" style={h3}>Faili</Heading>
              <ul style={{ paddingLeft: '18px', fontSize: '13px' }}>
                {files.map((u, i) => (
                  <li key={i}><Link href={u}>{(u.split('?')[0] || u).split('/').pop() || u}</Link></li>
                ))}
              </ul>
            </>
          ) : null}

          <Hr style={{ borderColor: '#eee', margin: '22px 0 0' }} />
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: QuoteAssignedEmail,
  subject: (d: Props) => `Cenu pieprasījums — ${d.company || d.name || 'klients'}`,
  displayName: 'Pieprasījums nodots',
  previewData: {
    assigneeName: 'Ilona',
    name: 'Jānis Bērziņš',
    email: 'janis@example.com',
    company: 'SIA Piemērs',
    worksheetUrl: 'https://example.com/saraksts/token',
  },
} satisfies TemplateEntry
