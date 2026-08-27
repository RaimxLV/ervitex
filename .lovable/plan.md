# Admin paneļa audits un sakārtošana

Izgāju cauri visām admin sadaļām un pārbaudīju, kuras reāli izmanto dzīvie dati (katalogs nāk no partneru API caur `catalog_items_mv`).

## Ko atradu

### A. Mantojums, ko vairs neizmanto (var izmest)

1. **Tulkošana** (`/admin/translate`) — taisīta vecajiem manuāli ievadītajiem produktiem. Tulkojumu produktiem tagad veic dzīvā tulkošana preces kartītē. Sadaļa un abas fona funkcijas (produktu/kategoriju tulkošana) vairs nedara neko noderīgu.
2. **Vecais manuālais katalogs** — `Produkti` (1745 ieraksti, 575 "aktīvi") un `Kategorijas` (20) neparādās publiskajā katalogā vispār. Ar tiem saistīta arī vecā preces lapa `/product/:id`, kas nav sasniedzama no neviena linka.
3. **Beechfield Excel imports** (`/admin/beechfield-import`) — vienreizējs rīks; tagad Beechfield/Bagbase/Quadra nāk no `beechfield-sync` (672 modeļi). Nav vajadzīgs ikdienā.
4. **Dublēšanās Panelī** — sākumlapā ir liels Stanley/Stella sinhronizācijas bloks + 500 iepirkuma cenu tabula, kas pārklājas ar `Cenu audita` sadaļu.
5. Neizmantoti koda gabali: vecā kategoriju filtra komponente, vecās preces lapas komponentes.

### B. Ieviests, bet nepabeigts

1. **Pieprasījumi** (`/admin/quotes`) — rāda tikai vārdu, e-pastu un ziņu. Nerāda pašu pasūtījuma sarakstu (preces, krāsas, izmēri, daudzumi), pievienotos failus un atbildīgo projekta vadītāju, lai gan tas viss tiek saglabāts. Nav arī pogas "Atbildēt e-pastā".
2. **Panelis** — SS sinhronizācija iet 5 soļos pēc kārtas bez atcelšanas; ja kāds solis noķeras, lapa paliek "syncing" stāvoklī.

## Ko darīšu

**Izņemšu:**
- Sadaļas `Tulkošana`, `Kategorijas`, `Produkti` (+ produkta forma), `Beechfield imports` un maršrutu `/product/:id`
- Ar tām saistītās lapas/komponentes un divas neizmantotās fona funkcijas (produktu un kategoriju tulkošana)
- Datu bāzes tabulas **neaiztieku** (dati paliek drošībā, tikai admin virsma pazūd)

**Sakārtošu:**
- **Panelis**: tikai reāli noderīgā info — pieprasījumu/piedāvājumu skaitītāji, katalogu statuss pa piegādātājiem (modeļu un cenu segums), SS un NWG sinhronizācijas statuss ar korektu kļūdu apstrādi un taimautu (vairs neuzkaras)
- **Pieprasījumi**: pilns pasūtījuma saraksts (prece, krāsa, izmērs, daudzums), pielikumu saites, atbildīgais PM, poga "Atbildēt e-pastā" un statusa maiņa
- **Navigācija**: paliek 5 sadaļas — Panelis, Piedāvājumi, Pieprasījumi, Cenu audits, Mega izvēlne (+ Lietotāji tikai galvenajam adminam)

## Tehniskās detaļas

- Noņemu maršrutus un lazy-importus `src/App.tsx`, atbilstošos `src/pages/admin/*` failus, `src/pages/ProductDetailPage.tsx`, `src/components/ProductCard.tsx`, `src/components/product/*`, `src/components/catalog/CategoryFilter.tsx`
- Dzēšu edge funkcijas `translate-products`, `translate-categories`; `translate-text` PALIEK (to lieto dzīvā aprakstu tulkošana)
- `AdminLayout.tsx` navigācija saīsināta; `AdminDashboard.tsx` pārrakstīts uz statusa paneli ar `Promise.allSettled` + taimautu katram sync solim
- `AdminQuotes.tsx` lasa `items`, `file_urls`, `assigned_pm_email`; failiem ģenerēju parakstītas saites no `quote-attachments`
