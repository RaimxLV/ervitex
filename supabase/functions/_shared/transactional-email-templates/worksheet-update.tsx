/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Hr, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  message?: string
  pmName?: string
  pmEmail?: string
  company?: string
  clientName?: string
  worksheetUrl?: string
}

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', color: '#111' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '22px' }
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

const WorksheetUpdateEmail = ({ message = '', pmName = '', pmEmail = '', worksheetUrl = '' }: Props) => (
  <Html lang="lv">
    <Head />
    <Preview>{message.slice(0, 90) || 'Preču saraksts'}</Preview>
    <Body style={main}>
      <Container style={container}>
        {worksheetUrl ? (
          <Section style={{ marginBottom: '18px' }}>
            <Button href={worksheetUrl} style={cta}>ATVĒRT PREČU SARAKSTU</Button>
          </Section>
        ) : null}
        <Text style={{ fontSize: '14px', lineHeight: '21px', whiteSpace: 'pre-line' as const, margin: '0 0 16px' }}>{message}</Text>
        <Hr style={{ borderColor: '#eee', margin: '22px 0 10px' }} />
        <Text style={{ fontSize: '12px', color: '#666', margin: '0' }}>{[pmName, pmEmail].filter(Boolean).join(' · ')} · Ervitex</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WorksheetUpdateEmail,
  subject: (d: Props) => `Cenu pieprasījums — ${d.company || d.clientName || 'Ervitex'}`,
  displayName: 'Ziņa klientam ar preču sarakstu',
  previewData: { message: 'Labdien!\nPievienoju atjaunināto sarakstu.', pmName: 'Laura', pmEmail: 'laura@ervitex.lv', worksheetUrl: 'https://example.com/saraksts/token' },
} satisfies TemplateEntry
