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

interface OfferLine {
  name?: string
  code?: string
  colorName?: string
  size?: string
  qty?: number | string
  unitPrice?: number | string | null
  lineTotal?: string
}

interface Props {
  title?: string
  clientName?: string
  note?: string
  items?: OfferLine[]
  totalQty?: number | string
  net?: string
  vat?: string
  gross?: string
  vatRate?: number | string
  url?: string
  disclaimer?: string
  isTest?: boolean
}

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', color: '#111' }
const container = { maxWidth: '680px', margin: '0 auto', padding: '20px' }
const headerBar = { borderBottom: '3px solid #E11D2E', paddingBottom: '12px', marginBottom: '16px' }
const h1 = { fontSize: '20px', margin: '0', letterSpacing: '0.5px', color: '#111' }
const subtle = { color: '#666', fontSize: '12px', margin: '4px 0 0' }
const rowCell = { padding: '8px', borderBottom: '1px solid #eee', fontSize: '13px' as const }
const th = { padding: '8px', textAlign: 'left' as const, fontSize: '12px', color: '#fff', background: '#111' }
const btn = {
  backgroundColor: '#E11D2E',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 'bold' as const,
  padding: '12px 22px',
  borderRadius: '2px',
  textDecoration: 'none',
  display: 'inline-block',
}

const PmOfferEmail = ({
  title = 'Ervitex piedāvājums',
  clientName = '',
  note = '',
  items = [],
  totalQty = '',
  net = '',
  vat = '',
  gross = '',
  vatRate = 21,
  url = '',
  disclaimer = '',
  isTest = false,
}: Props) => (
  <Html lang="lv">
    <Head />
    <Preview>{`${title} — Ervitex piedāvājums`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerBar}>
          <Heading style={h1}>{isTest ? 'TESTS · ' : ''}{title.toUpperCase()}</Heading>
          <Text style={subtle}>ervitex.lv · Piedāvājums</Text>
        </Section>

        <Text style={{ fontSize: '14px' }}>Sveiki{clientName ? `, ${clientName}` : ''}!</Text>
        <Text style={{ fontSize: '14px' }}>
          Zemāk atradīsi mūsu sagatavoto piedāvājumu. Ja rodas jautājumi vai vēlies izmaiņas, vienkārši
          atbildi uz šo e-pastu.
        </Text>

        {items.length > 0 && (
          <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: 'collapse', marginTop: '16px' }}>
            <thead>
              <tr>
                <th style={th}>Prece</th>
                <th style={th}>Gab.</th>
                <th style={th}>Cena</th>
                <th style={th}>Summa</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td style={rowCell}>
                    {it.name || ''}
                    <br />
                    <span style={{ color: '#666', fontSize: '11px' }}>
                      {[it.code, it.colorName, it.size].filter(Boolean).join(' · ')}
                    </span>
                  </td>
                  <td style={rowCell}>{it.qty ?? ''}</td>
                  <td style={rowCell}>{it.unitPrice ? String(it.unitPrice) : 'pēc pieprasījuma'}</td>
                  <td style={rowCell}>{it.lineTotal || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Hr style={{ borderColor: '#eee', margin: '18px 0' }} />

        <Text style={{ fontSize: '13px', margin: '2px 0' }}>Daudzums: {totalQty} gab.</Text>
        <Text style={{ fontSize: '13px', margin: '2px 0' }}>Kopā bez PVN: {net}</Text>
        <Text style={{ fontSize: '13px', margin: '2px 0' }}>PVN {vatRate}%: {vat}</Text>
        <Text style={{ fontSize: '15px', fontWeight: 'bold', margin: '6px 0 0' }}>Kopā ar PVN: {gross}</Text>

        {note && (
          <>
            <Hr style={{ borderColor: '#eee', margin: '18px 0' }} />
            <Text style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>{note}</Text>
          </>
        )}

        {url && (
          <Section style={{ margin: '22px 0' }}>
            <Button href={url} style={btn}>SKATĪT PIEDĀVĀJUMU TIEŠSAISTĒ</Button>
          </Section>
        )}

        {disclaimer && (
          <Text style={{ fontSize: '11px', color: '#666', lineHeight: '1.5' }}>{disclaimer}</Text>
        )}

        <Hr style={{ borderColor: '#eee', margin: '18px 0' }} />
        <Text style={subtle}>Ervitex · birojs@ervitex.lv · www.ervitex.lv</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PmOfferEmail,
  subject: (data: Props) => `${data?.isTest ? '[TESTS] ' : ''}${data?.title || 'Ervitex piedāvājums'}`,
  displayName: 'PM piedāvājums klientam',
  previewData: {
    title: 'Komandas krekli — SIA Piemērs',
    clientName: 'Jānis',
    items: [{ name: 'Stanley/Stella Creator', code: 'STTU755', colorName: 'Black', size: 'L', qty: 20, unitPrice: '9,50 €', lineTotal: '190,00 €' }],
    totalQty: 20,
    net: '190,00 €',
    vat: '39,90 €',
    gross: '229,90 €',
    vatRate: 21,
    url: 'https://www.ervitex.lv/piedavajums/demo',
    disclaimer: 'Cenas ir informatīvas.',
  },
} satisfies TemplateEntry
