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
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  worksheetUrl?: string
  submittedAt?: string
}

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', color: '#111' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '22px' }
const header = { borderBottom: '1px solid #111', paddingBottom: '12px', marginBottom: '18px' }
const h1 = { fontSize: '20px', margin: '0', letterSpacing: '0.4px', color: '#111' }
const subtle = { color: '#666', fontSize: '12px', margin: '4px 0 0' }
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

const QuoteConfirmationEmail = ({ name = '', worksheetUrl = '', submittedAt = '' }: Props) => (
  <Html lang="lv">
    <Head />
    <Preview>Pieprasījums saņemts</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>PIEPRASĪJUMS SAŅEMTS</Heading>
          {submittedAt ? <Text style={subtle}>{submittedAt}</Text> : null}
        </Section>

        {name ? <Text style={{ fontSize: '14px', margin: '0 0 16px' }}>{name}</Text> : null}

        {worksheetUrl ? (
          <Section>
            <Button href={worksheetUrl} style={cta}>ATVĒRT PREČU SARAKSTU</Button>
          </Section>
        ) : null}

        <Hr style={{ borderColor: '#eee', margin: '22px 0 10px' }} />
        <Text style={{ fontSize: '12px', color: '#666', margin: '0' }}>birojs@ervitex.lv · +371 67436899</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: QuoteConfirmationEmail,
  subject: () => 'Pieprasījums saņemts — Ervitex',
  displayName: 'Pieprasījuma apstiprinājums',
  previewData: {
    name: 'Jānis Bērziņš',
    submittedAt: new Date().toLocaleString('lv-LV'),
    worksheetUrl: 'https://example.com/saraksts/token',
  },
} satisfies TemplateEntry
