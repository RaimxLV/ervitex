import * as React from "react";
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Img } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import type { offerEmailData } from "../offerEmailData";

type Props = Partial<ReturnType<typeof offerEmailData>>;
const palette = { background: "#ffffff", foreground: "#111111", muted: "#666666", border: "#eeeeee", accent: "#991b2f" };
const cell = { padding: "8px 5px", borderBottom: `1px solid ${palette.border}`, fontSize: "12px" };
const header = { ...cell, textAlign: "left" as const, fontWeight: "bold" as const };

export const PmOfferEmail = ({ title = "Ervitex piedāvājums", clientName = "", items = [], note = "", pmName = "", pmEmail = "birojs@ervitex.lv", discount = "", totalQty = 0, net = "", vat = "", gross = "", vatRate = 21, url = "" }: Props) => (
  <Html lang="lv"><Head /><Preview>{title} — Ervitex</Preview>
    <Body style={{ backgroundColor: palette.background, color: palette.foreground, fontFamily: "Arial, sans-serif" }}>
      <Container style={{ maxWidth: "760px", padding: "20px", margin: "0 auto" }}>
        <Img src="https://www.ervitex.lv/ervitex-logo-dark.svg" alt="Ervitex" height="48" />
        <Heading style={{ fontSize: "22px", borderBottom: `3px solid ${palette.accent}`, paddingBottom: "14px" }}>{title}</Heading>
        <Text>Sveiki{clientName ? `, ${clientName}` : ""}!</Text>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
          <thead><tr>{["Prece", "Gab.", "Cena/gab.", "Atlaide %", "Atlaide €", "Summa"].map((label) => <th key={label} style={header}>{label}</th>)}</tr></thead>
          <tbody>{items.map((item, index) => <tr key={index}>
            <td style={cell}>{item.name}<br /><span style={{ color: palette.muted }}>{[item.code, item.colorName, item.size].filter(Boolean).join(" · ")}</span>{item.prints.map((print, k) => <div key={k}>{print}</div>)}</td>
            <td style={cell}>{item.qty}</td><td style={cell}>{item.unitPrice || "pēc pieprasījuma"}</td>
            <td style={cell}>{item.discountPercent}%</td><td style={cell}>{item.discountAmount}</td><td style={cell}>{item.lineTotal}</td>
          </tr>)}</tbody>
        </table>
        <Text>Daudzums: {totalQty} gab.</Text>{discount && <Text>Atlaide: {discount}</Text>}
        <Text>Kopā bez PVN: {net}</Text><Text>PVN {vatRate}%: {vat}</Text><Text style={{ fontWeight: "bold" }}>Kopā ar PVN: {gross}</Text>
        {note && <Text style={{ whiteSpace: "pre-wrap" }}>{note}</Text>}
        {url && <Button href={url} style={{ backgroundColor: palette.accent, color: palette.background, padding: "12px 18px", borderRadius: "2px" }}>Skatīt piedāvājumu</Button>}
        <Text>{pmName ? `${pmName} · ` : ""}{pmEmail}</Text><Text>Ervitex · www.ervitex.lv</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: PmOfferEmail, subject: (data: Props) => data.title || "Ervitex piedāvājums",
  displayName: "Piedāvājums klientam",
  previewData: { title: "Preču piedāvājums", items: [{ name: "Krekls", code: "STTU169", colorName: "Black", size: "M", qty: 10, unitPrice: "20,00 €", discountPercent: 15, discountAmount: "30,00 €", lineTotal: "170,00 €", prints: [] }], totalQty: 10, net: "170,00 €", vat: "35,70 €", gross: "205,70 €", vatRate: 21 },
} satisfies TemplateEntry;