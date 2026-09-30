# Apdruka, atlaide, "Ir noliktavā" un klienta rekvizīti

Punkts 4 (sietspiede min. 25 gab.) jau izlabots.

## 1. Apdrukas izmaksas un atlaide (pieprasījuma saraksts un piedāvājums)
- **Preču saraksts (/saraksts):** apdrukas rindas jau ir (Sietspiede, DTF, Izšūšana, Sublimācija, Cita; cena par gab. vai kopā). Pievieno **atlaidi**: viens lauks visam sarakstam, % vai € (pārslēdzams). Kopsavilkumā: Preces, Apdruka, Atlaide (−), Kopā bez PVN, PVN, Kopā ar PVN.
- **Piedāvājums (admin → Piedāvājumi):** katrai precei poga "+ Apdruka" ar tām pašām rindām kā sarakstā, un tas pats atlaides lauks. Klienta piedāvājuma lapa un e-pasts rāda apdruku pie preces un atlaidi kopsavilkumā.
- Atlaidi redz un maina tikai projekta vadītājs.
- Kad no pieprasījuma izveido piedāvājumu, apdruka un atlaide tiek pārnesta.

## 2. "Ir noliktavā" atzīme
- Katalogā adminam (ielogotam) uz katras kartītes mazs slēdzis "Noliktavā" — viens klikšķis ieslēdz/izslēdz, bez papildu lapām. Tas pats slēdzis preces skatā.
- Klientiem: šaura zaļa josla bildes apakšā "IR NOLIKTAVĀ" (virs bildes, kartītes izmērs nemainās). Preces skatā tāda pati atzīme pie bildes.
- Katalogā filtrs "Ir noliktavā".
- Atzīme saglabājas arī pēc piegādātāju sinhronizācijas.

## 3. Klienta rekvizīti pieprasījuma formā
- /request lapā izvēles sadaļa "Rekvizīti rēķinam" (atverama): uzņēmuma nosaukums, reģ. nr., PVN nr., juridiskā adrese, piegādes adrese.
- Rekvizīti redzami adminā pie pieprasījuma, preču sarakstā un e-pastā projekta vadītājai; pārnesas piedāvājumā.

## Tehniskā daļa
- Jauna tabula `stock_flags(source, item_id, updated_by, updated_at)`: lasīt visi, rakstīt tikai admin (`has_role`). Karte ielādēta vienreiz katalogā.
- `quote_requests`: `billing jsonb`, `discount jsonb` (`{type:'percent'|'amount', value}`); `pm_offers`: `discount jsonb`, items jau jsonb — pievieno `prints`.
- Atjaunināt `save_quote_worksheet`/`get_quote_worksheet`, `get_pm_offer`, `worksheetTotals`/`offerTotals` ar atlaidi; e-pasta veidnes (quote-request, pm-offer).
