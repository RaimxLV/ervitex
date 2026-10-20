import * as React from "react";
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Img } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import type { offerEmailData } from "../offerEmailData";

type Props = Partial<ReturnType<typeof offerEmailData>>;
const palette = { background: "#ffffff", foreground: "#111111", muted: "#666666", border: "#eeeeee", accent: "#991b2f" };
const cell = { padding: "10px 0", borderBottom: `1px solid ${palette.border}`, fontSize: "14px", overflowWrap: "anywhere" as const };

export const PmOfferEmail = ({ lang = "lv", title = "Ervitex piedāvājums", clientName = "", items = [], note = "", pmName = "", pmEmail = "birojs@ervitex.lv", discount = "", totalQty = 0, net = "", vat = "", gross = "", vatRate = 21, url = "" }: Props) => {
  const t = (lv: string, en: string) => lang === "lv" ? lv : en;
  return <Html lang={lang}><Head /><Preview>{title} — Ervitex</Preview>
    <Body style={{ backgroundColor: palette.background, color: palette.foreground, fontFamily: "Arial, sans-serif" }}>
      <Container style={{ maxWidth: "760px", padding: "20px", margin: "0 auto" }}>
        <Img src="https://www.ervitex.lv/ervitex-logo.png" alt="Ervitex" width="180" height="50" />
        <Heading style={{ fontSize: "22px", borderBottom: `3px solid ${palette.accent}`, paddingBottom: "14px" }}>{title}</Heading>
        <Text>{t("Sveiki", "Hello")}{clientName ? `, ${clientName}` : ""}!</Text>
        {items.map((item, index) => <table key={index} width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse", tableLayout: "fixed" }}><tbody><tr><td style={cell}>
          <strong>{item.name}</strong><br /><span style={{ color: palette.muted }}>{[item.code, item.colorName, item.size].filter(Boolean).join(" · ")}</span>
          <div style={{ marginTop: "8px" }}>{item.qty} {t("gab.", "pcs")} × {item.unitPrice || t("pēc pieprasījuma", "on request")}</div>
          {item.discountPercent > 0 && <div>{t("Atlaide", "Discount")}: {item.discountPercent}% · −{item.discountAmount}</div>}
          <div>{t("Summa bez PVN", "Subtotal excl. VAT")}: <strong>{item.lineTotal || t("pēc pieprasījuma", "on request")}</strong></div>
          {item.prints.map((print, k) => <div key={k}>{print}</div>)}
        </td></tr></tbody></table>)}
        <Text>{t("Daudzums", "Quantity")}: {totalQty} {t("gab.", "pcs")}</Text>{discount && <Text>{t("Atlaide", "Discount")}: {discount}</Text>}
        <Text>{t("Kopā bez PVN", "Total excl. VAT")}: {net}</Text><Text>{t("PVN", "VAT")} {vatRate}%: {vat}</Text><Text style={{ fontWeight: "bold" }}>{t("Kopā ar PVN", "Total incl. VAT")}: {gross}</Text>
        {note && <Text style={{ whiteSpace: "pre-wrap" }}>{note}</Text>}
        {url && <Button href={url} style={{ backgroundColor: palette.accent, color: palette.background, padding: "12px 18px", borderRadius: "2px" }}>{t("Skatīt piedāvājumu", "View offer")}</Button>}
        <Text>{pmName ? `${pmName} · ` : ""}{pmEmail}</Text><Text>Ervitex · www.ervitex.lv</Text>
      </Container>
    </Body>
  </Html>;
};

export const template = {
  component: PmOfferEmail, subject: (data: Props) => data.title || "Ervitex piedāvājums",
  displayName: "Piedāvājums klientam",
  previewData: { title: "Preču piedāvājums", items: [{ name: "Krekls", code: "STTU169", colorName: "Black", size: "M", qty: 10, unitPrice: "20,00 €", discountPercent: 15, discountAmount: "30,00 €", lineTotal: "170,00 €", prints: [] }], totalQty: 10, net: "170,00 €", vat: "35,70 €", gross: "205,70 €", vatRate: 21 },
} satisfies TemplateEntry;