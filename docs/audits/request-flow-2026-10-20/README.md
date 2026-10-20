# Pieprasījumu un piedāvājumu audits — 2026-10-20

## Statuss

Sadales migrācija pielietota; zemāk uzskaitītie labojumi pārbaudīti izolēti un ar sintētiskiem pārlūka datiem. Tas NAV apgalvojums, ka jaunā plūsma jau izvietota un pārbaudīta produkcijā. Nav nosūtīti īsti e-pasti, veidoti īsti klientu pieprasījumi/piedāvājumi, palaistas piegādātāju sinhronizācijas vai publicēta lietotne. Meklēšanas/kataloga loģika šajā darbā nav mainīta.

### Atkārtotā pārbaude pēc 09:22 drošības precizējuma

- Izolētais `requestFlowIsolated.py` atkārtoti PASS: stingra secība, 12 jauni + 12 atkārtoti vienlaikus, viena ID 17 mēģinājumi, nepareizas atslēgas atteikums, 12 viena normalizēta e-pasta iesniegumi, manuālā atbildīgā saglabāšana, 44 viltotas vadītājas ignorētas. Testa datubāze pēc tīrīšanas: 6 sākotnējās rindas nemainītas, pozīcija 1.
- 9 fokusētie Vitest faili / 36 testi PASS; pielikumu/atslēgas Deno testi 3/3 PASS. Šajā kārtā nav atkārtots viss 296 testu komplekts.
- `/tmp/browser/request-audit/recheck-0924.log`: admina pieprasījums → sintētisks piedāvājums → pārlāde saglabā Ilonu, 50 gab., Black/M un DTF; kontaktu un groza formām viena saglabāšana / divi paziņojuma mēģinājumi. Visi ieraksti un sūtījumi aizstāti ar mock, 0 JS kļūdu; 5 bezsaistes e-pasti 390px bez pārplūdes. Piedāvājuma un EN e-pasta ekrānattēli vizuāli pārbaudīti. Sesija atjaunota paša lietotāja kontam, ne izdomātam adminam.
- Tikai-lasāms produkcijas stāvoklis: 6 rindas, nākamā pozīcija 1. Jaunā īpašnieka projekcijas kontrolsumma `41881c23c5dcc0d454aa90b2da154dc8` lieto citādu projekcijas formātu nekā iepriekšējā; tās nedrīkst tieši salīdzināt kā izmaiņu pierādījumu.
- Jaunākais automātiskais signāls 09:23:16 UTC: build OK. Nav lietotnes/funkciju izvietošanas vai produkcijas rakstījumu.
- Zemāk minētie izlaiduma, pārlādes idempotences, tukšā apstiprinātā saraksta un īstā servera/Safari ierobežojumi paliek atvērti; pašreizējā kārta tos neuzdod par atrisinātiem.

## Pārbaudītie labojumi

- `docs/audits/sql/2026-10-20-request-flow.sql` pielietots kā `drizzle/migrations/0022_request_assignment_capability.sql`. Saglabāta rotācijas pozīcija **1 = nākamā Ilona** un sešas vēsturiskās rindas. Jauno klientu cikls Laura → Ilona → Justīne → Santa; esošā pozīcija netiek atiestatīta.
- `assign_quote_request_manager` bloķē rotācijas rindu; normalizē tikai e-pastu (`lower/btrim`), atkārtotam klientam saglabā jaunāko vēsturisko/manuālo atbildīgo, arī ārpus četrām vadītājām. Nepilna atbildīgā informācija izraisa pārbaudāmu atteikumu, ne nejaušu pārdali. Nav klienta uzņēmuma ID modeļa; netiek izmantota vārdu/domēnu līdzība.
- Publiski padota vadītāja tiek ignorēta; faktiskos kontaktus nosaka serveris. `submit_quote_request` pirms saglabāšanas bloķē iesnieguma ID; atkārtots ID+atslēga nemaina saturu vai rotāciju, cita atslēga tiek noraidīta.
- `src/lib/requestSubmission.ts`, `submitRequest.ts`, `QuoteRequestForm.tsx`, `ContactPage.tsx`, `RequestPage.tsx`: vienas atvērtās formas ietvaros atkārtoti izmanto saglabāto ID, atslēgu un nemainīto saturu; paziņošanas kļūda neveido otru pieprasījumu. Ir `finally` un sinhrona dubultklikšķa aizsardzība; atgriezta invoke kļūda netiek uzskatīta par piegādi.
- `supabase/functions/send-quote-request/index.ts`: noņemta COUNT balstīta alternatīvā sadale; paziņojums izmanto tikai saglabāto atbildīgo. Pārbauda iesnieguma atslēgu vai administratoru. Pielikumi tikai attiecīgā pieprasījuma UUID mapē; cita pieprasījuma/patvaļīgi ceļi noraidīti. Bojāts URI e-pasta atveidi nesalauž.
- Apdrukas statuss augšā admina kartītē, sarakstā un darbinieka e-pastā: **Nepieciešama apdruka / Bez apdrukas / Apdruka nav norādīta**, neatkarīgi no cenas. Garus komentārus var izvērst.
- `requestOffer.ts` un `CreateOfferButton`: pieprasījuma pārvēršana saglabā atbildīgo, kontaktus/rekvizītus, preču krāsas/izmērus/skaitu, apdruku, atlaides un PVN. Nomaiņa saglabā apdrukas; nepieejama izmēra/krāsas cena netiek aizņemta no iepriekšējā varianta. Apzināti ievadīta nulles cena netiek automātiski aizvietota.
- `offerValidation`, `offerEmailData`, `sendOffer.functions`, `AdminOfferEdit`: cenas/skaits/PVN/atlaides tiek validēti, sūtīšana aizsargāta serverī; LV/EN e-pastā saskan summas, arī 0 €. Neapstiprinātas apdrukas cenas neizdomā.
- `pm-offer.tsx`: LV/EN teksts, droši atveidots klienta saturs, mobilais izkārtojums un PNG logotips SVG vietā; saites uz www.ervitex.lv, atbildīgā Reply-To. Reālu pasta klientu/piegādes pārbaude nav veikta.
- Kopīgajos/iekšējos sarakstos nav patērētāja groza pogas. Atrasts un reproducēts viesu groza atjaunošanas defekts: sākotnējais tukšais stāvoklis pārrakstīja saglabāto grozu; tagad rakstīšana sākas pēc atjaunošanas. Identitātē ir arī piegādātājs.

## Pierādījumi

- Galīgais Vitest: **47 faili, 294 testi PASS**; `/tmp/requests-audit/final-vitest.log`.
- Deno pielikumu/atslēgas testi: **3/3 PASS**; funkcija netika izsaukta.
- `python3 src/test/requestFlowIsolated.py`: atsevišķs lokāls PostgreSQL, ne produkcija. Secība 4/4; 12 jauni+12 atkārtoti vienlaikus; 17 viena ID mēģinājumi = viena rinda/viena pozīcijas maiņa; nepareiza atslēga noraidīta; 12 vienāda normalizēta e-pasta mēģinājumi = viena rotācijas maiņa; divas manuālās piesaistes saglabātas; 44 viltotas vadītājas ignorētas; 6/6 vēsturiskās rindas identiskas pēc tīrīšanas, pozīcija atjaunota uz 1.
- Produkcijas tikai-lasāma pārbaude: pozīcija 1, sešas vēsturiskās rindas; atbildības projekcijas kontrolsumma `2212515adf8636616b1d52dde52ac220`.
- Sintētiskais Chromium tests: autentificēta admina skatījums, kartītes apdruka/izvēršana, pieprasījums → piedāvājums → pārlāde (Ilona, 50 gab., Black/M, DTF), kopīgais saraksts, kontaktu un groza formas paziņojuma atkārtojums. **Visi datu rakstījumi un sūtījumi aizstāti ar mock**; 1 saglabāšana/2 paziņošanas mēģinājumi, 0 JS kļūdu. Tas nepierāda īsta servera sūtīšanas ceļa darbību.
- Pieci bezsaistes HTML paraugi šajā mapē: LV/EN piedāvājums un pieprasījums ar DTF/bez apdrukas/nenorādītu apdruku. `render-previews.tsx` neimportē sūtītāju; sintētiski `.invalid` klientu kontakti. 390px platumā nav horizontālas pārplūdes.
- Pārlūka skripts/logs un ekrānattēli: `/tmp/browser/request-audit/`; atsevišķi `offer-converted-desktop.png`, `worksheet-mobile.png`, `contact-retry.png`, `request-mobile-retry.png`, pieci e-pasta ekrānattēli.
- Automātiskais būves signāls 09:16:22 UTC: **build OK**. Pēc pēdējām lapu metadatu izmaiņām jāpārbauda jaunākais signāls.

## Atklātie ierobežojumi un izvietošana

1. **Publiskā versija un `send-quote-request` nav šajā darbā izvietotas.** Jaunais klients padod iesnieguma atslēgu; jaunais paziņotājs to pieprasa. Root jāplāno kopīga saderīga klienta/paziņotāja izlaišana: nedrīkst vispirms neatkarīgi izvietot jauno paziņotāju, kamēr vecais publiskais klients vēl nepadod atslēgu. Veco tiešo INSERT politika saglabāta saderībai, bet atbildīgo nosaka drošais trigeris arī šajā ceļā.
2. **Paziņojuma atkārtošana pārbaudīta tikai vienā atvērtajā formā.** ID/atslēga/saturs ir atmiņā; pārlāde vai aizvēršana zaudē atkārtošanas stāvokli. Pārlādējot un iesniedzot vēlreiz, iespējams jauns pieprasījums. Noturīga atjaunošana ar failu atgūšanu nav ieviesta; nav pamata apgalvot idempotenci pāri pārlādēm.
3. **Apzināti iztukšots apstiprināts saraksts:** pašreizējā konversija izvēlas netukšu `worksheet_items`, citādi sākotnējos `items`. Ja atļauts piedāvājumā pārvērst apstiprinātu tukšu sarakstu, šis robežgadījums jāprecizē pirms plašākas konversijas lietošanas.
4. **Autentificētais reālā servera gala ceļš: UNVERIFIED.** Datu rakstījumi/sūtījumi apzināti nenotika; pārbaudītas lokālās SQL tiesības, servera validācija un autentificēta sintētiskā UI, ne produkcijas ieraksts vai e-pasta piegāde. Safari jaunās cilnes sesijas regresija šajā auditā nav izmeklēta/labota.
5. Root pārskats pirms publicēšanas; nav nepieciešams vēlreiz pielietot identisko jau pielietoto SQL. Katalogs/cenas/sinhronizācijas nav šī izlaiduma darbs.

## Izlaiduma kārta 2026-10-20 09:35 UTC (tikai admina plūsma)

Atrisināts (vienībtesti, bez īstiem rakstījumiem/e-pastiem):
- **Pārlāde**: kontaktu, produkta un groza formas glabā neapziņoto pieprasījumu (id, iesnieguma atslēga, nemainīgs saturs, augšupielādētie ceļi, failu nosaukumi) cilnes `sessionStorage`; pēc pārlādes forma bloķēta ar oriģinālajiem datiem, atkārtojums tikai paziņo to pašu pieprasījumu (nekāda otrā saglabāšana/rotācija). Notīra tikai pēc veiksmīgas piegādes. 403/404 atteikums saglabājas kā termināls `rejected` stāvoklis ar to pašu id arī pēc pārlādes: pastāvīgs "saglabāts, bet paziņojums nav apstiprināts" paziņojums, sūtīšana bloķēta; notīrīt var tikai apzināti ar "Sākt jaunu pieprasījumu". Groza lapa gaidošā pieprasījuma laikā rāda/skaita tā nemainīgo saturu, nepārrakstot pašreizējo grozu. Nepieejama `sessionStorage` (SecurityError) nesalauž lapu. Bojāts/svešu ceļu stāvoklis tiek izmests. Failu saturu pēc pārlādes nevar atjaunot — augšupielādētie ceļi paliek, neaugšupielādētie faili tiek nosaukti ar lūgumu sūtīt uz birojs@ervitex.lv.

## Izlaišana 2026-10-20 (pierādījumi)

- Frontend: commit `fa95c3d6`, root deploy `b5729edd-…`. Apstiprināts tiešsaistē www.ervitex.lv/request: ielādētie bundles satur jauno kodu (`submitRequest-CKDW-Tc3.js` — "Sākt jaunu pieprasījumu", `submission_key`; `index-CMlKG_24.js` — `confirmed_empty`).
- Tikai pēc tam izvietots `send-quote-request` (ar `_shared/request-safety.ts`, `_shared/send-app-email.ts`), source SHA-256 `ca39b644a42de2b75cf6559d57d189815eb057388638a69456bb87ef21bc6047`.
- Nemainošas pārbaudes: OPTIONS → 200; POST ar bojātu `request_id` → 400 `request_id required` (atgriežas pirms jebkura DB vaicājuma/e-pasta). Reāli id netika izmantoti; nekādu ierakstu vai e-pastu.
- Root izvēlējās neveikt reālu kontroles pieprasījumu; paļaujamies uz izolētajiem testiem (306 Vitest, Deno `request-safety_test.ts`, izolētā DB rotācija).
- Nepārbaudīts: reāla e-pasta piegāde vadītājam un klientam produkcijā; Safari jaunās cilnes sesijas problēma (izpētīta, nav salabota).
- **Tukšs apstiprināts saraksts**: `requestConversionSource` = worksheet / confirmed_empty (`worksheet_updated_at` + tukšs saraksts) / original. confirmed_empty bloķē konversiju ar redzamu paskaidrojumu; dzēstās preces netiek atjaunotas. Vēsturiski aizpildīta `worksheet_revision=1` bez apstiprināšanas laika paliek "original". Produkcijā šobrīd 0 šādu rindu (tikai lasīts).
- **noindex**: `/offers`, `/offers/$id`, `/saraksts/$token`, `/piedavajums/$token` — tests apstiprina `noindex, nofollow` un bez canonical.

Testi: 49 faili / 304 testi PASS; tipu pārbaude OK.

### Izlaišanas secība (root)
1. Publicē frontendu. Jaunais klients izmanto `submit_quote_request` (jau ir DB) un padod `submission_key`; pašreiz izvietotais `send-quote-request` lieko lauku ignorē, tātad saderīgs.
2. Pārbaudi produkcijā vienu kontroles pieprasījumu (root lēmums) un ka atbildīgais piešķirts.
3. Tikai tad izvieto `send-quote-request` (+ `_shared/request-safety.ts`). Tas pieprasa atslēgu vai admina lomu; atļaujas nav vājinātas, atslēga netiek atgriezta.
4. Vecās, pirms publicēšanas atvērtās cilnes: to tiešais INSERT joprojām saglabā pieprasījumu (atbildīgo nosaka trigeris), bet paziņojums saņems 403 — pieprasījums redzams adminā, e-pasts nenāk. Veco kodu labot nevar; risks = tikai paziņojums šīm cilnēm. Jaunais klients 403/404 rāda "saglabāts — atjauno vai raksti", nevis sūta vēlreiz.

### Gaida ārēju validāciju
- Īsts servera ceļš (RPC + paziņotājs) produkcijā pēc 1.–3. soļa.
- Safari jaunās cilnes sesijas regresija (tikai izpētīta).
