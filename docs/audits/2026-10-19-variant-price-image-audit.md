# Variantu, cenu un attēlu audits — 2026-10-19 (galīgā redakcija)

Statuss: daļējs audits (kods + iepriekš iegūti read-only DB skaitļi). Pilns svaigu piegādātāju feed audits NAV veikts. Nekas nav publicēts, DB nav rakstīts, sync nav izsaukts. Formulas un dati nav mainīti.

Apzīmējumi: **PIERĀDĪTS** — apstiprināts ar DB/API/pārlūku; **RISKS** — kodā redzams, ietekme nav pierādīta; **BLOĶĒTS** — nav pārbaudīts.

## Pierādījumu bāze (root, read-only)
- Redzami modeļi / ar cenu: BB 672/658, ETX 12/12, FR 255/255, MF 424/424, NWG 2858/2858, PF 2276/2213, RU 93/93, SS 159/159, UTT 527/527.
- Pozitīvas normalizētās cenu rindas: 137 412.
- Redzamu modeļu varianti bez normalizētās cenas (SKU join): FR 308, MF 0, PF 148, SS 0, UTT 15.
- Krāsas bez krāsas attēla URL katalogā: RU 494/494, UTT 3547/3547, FR 841/841, BB 36/2963, MF 13/2914, NWG 28/10366, PF 5/8213, SS 0/1564. Trūkstošs URL katalogā NENOZĪMĒ, ka foto neeksistē: RU 493/494 krāsām ir atbilstošas attēlu rindas pēc precīza nosaukuma; trūkst tikai 0R964M0 Light Blue.
- BB: nav aktīvu variantu ar skaidru izmēru, izņemot one-size.

## LIVE `refresh_catalog_prices` (root nolasīja iepriekšējā solī)
| Avots | Faktiskā formula |
|---|---|
| SS | partnera neto ×1,75; publiski +21% PVN |
| NWG | `COALESCE(pl.rec_price, NULLIF(k.retail_price,0)) × zīmola koef. × uzcenojums`, fallback `NULLIF(k.purchase_price,0)`. Clique 0,37×1,75; Craft 0,50×1,5; ProJob / Cutter&Buck 0,60×1,5. NAV `GREATEST` (vecākās migrācijas neatbilst live). |
| PF | normalizētā neto ×1,65; PVN pieskaita publiskais attēlojums. ×1,0165 netiek lietots. |
| MF | wholesale ×1,65; publiski +21% |
| BB | ×1,65; publiski +21% |
| UTT | Gildan ×2, Kariban ×1,8, Regatta ×1,75; publiski +21%. Live joprojām mediānas aizstāšana (003/004 neizpildīti). |
| FR | partnera cena ×1,55; publiski +21% |
| RU | `ru_prices.retail_price × 1,65` (model-wide, bez krāsas/izmēra) |
| ETX | `COALESCE(price_override, retail_price) / 1,21` kā normalizētā neto; publiski ×1,21. Saglabātā manuālā vērtība ir bruto; dubulta PVN nav. |

Visiem avotiem: viena vienības cena variantam neatkarīgi no daudzuma (tests 1/10/100 gab.).

## Koda audits pa avotiem
| Avots | Varianta atslēga | Izmēru izcelsme | Outlet | Apjoma cenas | Atradumi |
|---|---|---|---|---|---|
| SS | SKU | `ss_sizes`, `size_code`/`size_sequence` (`stanley-stella-sync/index.ts:112-121,201`) | nav avota pazīmes | nav | PIERĀDĪTS: `ss_sku_retail_prices` MIN(style) fallback skar 6 STJW190 SKU; labojums 003 neizpildīts. |
| NWG | SKU `model-color-size` | `nwg_skus.size_name` | nav | nav (customerprice pa SKU, `nwg-price-sync/index.ts:18`) | PIERĀDĪTS: 649066 Black S/M `-4`=15,30 / `-5`=16,83; L/XL `-6`/`-7` tas pats; `size_name` dublējas avotā. RISKS: izmēra izvēle var paņemt nepareizo SKU. |
| PF | itemcode | feed `size`/`sizeGrid` (`pf-concept-sync/index.ts:131-132`) | nav | RISKS: cena no teksta skena (`:406-473`), quantity=1 jāapstiprina | PIERĀDĪTS: 29 konfliktējošas krāsa+izmērs grupas (106505 BLACK `10650500`=89,08 vs `10650504`=131,08; K1058H GREY `K1058B7C`=15,13 vs B2C–B6C/8JC=14,42) — iespējams atšķirīgi atribūti; raw nav pārbaudīts. 148 varianti bez cenas, iemesls nav pierādīts. |
| MF | `productSizeCode` | API | PIERĀDĪTS: 6 redzami OUTLET modeļi (X20, 5Y1, X22, 5X8, 23Y, X35); `malfini-sync/index.ts:81-84` pārsauc OUTLET kategoriju | RISKS: `:57` ņem MIN pār `limit` līmeņiem; read-only API 18 238 rindām visas `limit=1` ⇒ pašlaik nav pierādītas apjoma cenu atšķirības | Labojums `003_sync_code.patch`, neizpildīts. |
| BB | SKU | gandrīz tikai one-size | nav | nav | 36 krāsām nav attēla URL. |
| UTT | SKU (`utt-sync/index.ts:164`) | stock export | PIERĀDĪTS: feed outlet 0/1 pazīme, 2485 outlet SKU; netiek importēta līdz 003 | nav | Live mediānas aizstāšana; 15 varianti bez cenas. |
| FR | SKU, matrix line (`falkross-sync/index.ts:257`) | `uniqueSortedSizes` (`:61-69`) | nav | viena cena rindā | PIERĀDĪTS: 308 redzamiem variantiem nav piegādātāja cenu rindu. Cēlonis (imports vai avots) NAV pierādīts bez svaiga feed. |
| RU | modelis (+krāsa foto) | RISKS: `sizesForColor` (`src/components/worksheet/useVariants.ts:104`) ņem izmērus tikai no cenu rindām; RU cenas bez izmēra, `ru_styles.sizes` netiek lasīts ⇒ piedāvājuma/pieprasījuma izmēru izvēle tukša | nav | nav | Izmēri netiek izdomāti; vajag lasīt `ru_styles.sizes`. |
| ETX | modelis | manuāli | n/a | nav | 12/12 ar cenu. |

## Attēli
- Russell kartītes krāsas foto labojums (`originalImageUrl` fallback, `CatalogModelCard.tsx`) ieviests, 195 testi izgāja. Kartīte pēc labojuma pārlūkā NAV pārbaudīta; pārbaudīta tikai detaļu lapa.
- Kartītes izvēlētā kadra proxy fallback tagad lieto tikai to pašu kadru (`unproxyUrl`); `UnifiedCatalog.tsx` neizmanto modeļa hover foto izvēlētai krāsai bez savas bildes; kļūdas paslēpšana atiestatās nākamajam kadram. Tests: pēc proxied un oriģinālā zaļā kļūdas nerāda melno.
- RISKS (paliek): krāsa bez savas bildes sākotnēji var rādīt modeļa foto; `CatalogItemDialog` galerija ne-RU avotiem pārslēdzas uz pirmo citas krāsas foto. Nav apgalvojuma, ka kartīte nekad nerāda citu krāsu.
- RU 0R964M0 Light Blue — foto trūkst datos.

## Lietotāja ziņotie gadījumi
- Russell krāsas maiņa nemainīja kartītes foto — kods labots, pārlūkā nepārbaudīts.
- Russell/Malfini masveida „Cena pēc pieprasījuma” — frontend cenu meklēšana labota.

## Neatrisinātie
- Cenas: NWG dublētie izmēri; PF 29 konflikti un 148 bez cenas; FR 308 bez cenas; UTT mediāna un outlet (003/004); MF outlet un MIN līmeņu kods (003); SS 6 SKU (003).
- Izmēri: RU piedāvājuma izmēru izvēle.
- Attēli: sākotnējais/detaļu citas krāsas fallback; UTT/FR krāsu foto pārlūkā.

## Bloķēts
- DB dīkstāve bloķē pašreizējās DB un pārlūka pārbaudes (kartīte, UTT/FR, publicētā vs priekšskatījuma salīdzinājums).
- Pilns svaigu piegādātāju feed audits nav veikts; DB dīkstāve pati to neaizliedz — neatkarīga read-only piekļuve piegādātājiem iespējama atsevišķi.

## Papildinājums 12:41–12:50 UTC
- **RU izmēri — izlabots kodā:** `sizesForColor` (`src/components/worksheet/useVariants.ts`) Russell gadījumā lieto `ru_styles.sizes` (0R013M0: XS–4XL, 8 izmēri) ar vienu model-wide cenu; tukšs saraksts → izmēri netiek izdomāti; konfliktējošas cenas → null; citi avoti paliek pie precīzām krāsa+izmērs rindām. Patērētājs: `RowVariantControls.tsx`. 4 jauni testi, 199/199 izgāja.
- **Attēli — izlabots kodā:** `UnifiedCatalog.tsx` izvēlētai krāsai bez savas bildes rāda tukšu lauku/ielādi, nevis modeļa foto; `CatalogItemDialog.tsx` galerija vairs neņem citas krāsas foto nevienam avotam; modeļa foto tikai, ja krāsu nav. Detaļu galerijai atsevišķa regresijas testa nav.
- **Pārlūka pārbaude — BLOĶĒTA:** 2 mēģinājumi (desktop+mobile) — `/catalog?source=ru&q=0R013M0` katalogs neielādējās novērotajās 8 s (ielādes kartītes, „0 rezultāti”); dīkstāve nav pierādīta. Kartītes Black /36/ → Bottle Green /38/ → Classic Red /CR/ un detaļu navigācija pēc labojuma NAV pārbaudīta pārlūkā.

- **12:45:** `cardImageFrames` (`src/hooks/useCatalogCardImages.ts`) izvēlētai krāsai vairs neatgriež modeļa pirmo foto vai bezkrāsas rindas (ja `firstIsColor=false`); bez savām bildēm → []. Ieviests un notestēts, pārlūkā NAV pārbaudīts.

## 12:56 kataloga ielāde
- Pārlūka tīkls: visi REST pieprasījumi (`catalog_items` HEAD count, `catalog_filter_order`, `catalog_remnants`, `stock_flags`, `mega_menu_items`) 30 s laikā neatbildēja; curl ar `limit=1` 3 tabulām — 25 s timeout bez HTTP koda; cloud_status: auth→database probe deadline exceeded. Cēlonis — backend nereaģē, nevis smags vaicājums vai filtru secība.
- Koda defekts: pieprasījumiem nebija laika limita, `useFilterOrder` kļūdā nekad nelika `ready`, un neizdevušās lapas tika klusi izlaistas. Labots: 20 s/8 s AbortSignal, kļūda+„Mēģināt vēlreiz”, filtru secība ar noklusējumu, daļējs katalogs → kļūda. Pārlūkā: „Mēģināt vēlreiz” parādās pēc ~21 s. Aizpildīts katalogs un Russell krāsas NAV pārbaudāmi, kamēr backend neatbild.

## 13:21 — pārbaude pēc backend atjaunošanas
**PĀRBAUDĪTS pārlūkā:** Russell 0R013M0 kartīte (1280 px un 390 px): Black `/36/` → Bottle Green `/38/` → Classic Red `/CR/` → Black `/36/` → Bottle Green `/38/`; katram kadram `complete && naturalWidth>0`, nav paslēpts; vizuāli sarkanais krekls pie Classic Red. Klikšķis atver `/catalog/item/ru/0R013M0?color=Bottle+Green` ar `/38/` galeriju.
**PĀRBAUDĪTS:** MF 174 kartīte — krāsa blue atoll (44), foto `174_44`, cena 8,84 € bez PVN = DB `catalog_variant_prices` 174/44 (8,84). MF S30 kartīte meklēšanā 60 s laikā netika atrasta (iespējams cits ID) — nepārbaudīts.
**NAV pārbaudīts pārlūkā:** RU piedāvājuma izmēru izvēle (vajag admina sesiju); segts ar unit testiem (8 izmēri, viena cena).

### NWG 649066-99 (DB, read-only)
| SKU | size kods | size_name | EAN | retail_price | rec_price |
|---|---|---|---|---|---|
| -4 | 4 | S/M | nav | 17,00 | nav |
| -5 | 5 | S/M | 7316220617205 | 18,70 | nav |
| -6 | 6 | L/XL | nav | 17,00 | nav |
| -7 | 7 | L/XL | 7316220617212 | 18,70 | nav |
Secinājums (RISKS, nav pierādīts): kodi 4/5/6/7 = S/M/L/XL, bet avots abus pārus sauc „S/M”/„L/XL”; -4/-6 bez EAN un ar citu cenu izskatās pēc novecojušiem/dublētiem SKU. Bez NWG API apstiprinājuma nevar droši izvēlēties; pašreizējā loģika konfliktā atgriež null (pareizi). Koda labojums nav veikts.

### PF (DB, read-only)
- 106505 BLACK: `10650500` (EAN 3501170951705, price 53,99, list 69,21) un `10650504` (EAN 3501170951804, price 79,44, bez list) — divi atsevišķi produkti ar atšķirīgu EAN, size nav.
- K1058 H_GREY: 35 SKU — 7 prefiksi (`K10588J*`, `K1058B2*`…`B7*`) × 5 izmēri (C=3/4, E=5/6, G=7/8, J=9/10, L=11/12), katram unikāls EAN; izmēri kartēti pareizi. Visiem saglabāts viens `color_code` H_GREY.
- Cēlonis (stipra hipotēze, nav pierādīta): `pf-concept-sync/index.ts:121-136` saglabā tikai `colors.color[0]` (primāro krāsu); vairākkrāsu/kontrastkrāsu varianti sakļaujas zem vienas krāsas. Pierādīšanai vajag PF produktu feed ierakstus šiem item code — nav ielādēts (190 MB feed, netika palaists). Koda labojums nav veikts, līdz semantika apstiprināta.

## 13:26 — PF oficiālā feed pārbaude (read-only)
Avots: `https://www.pfconcept.com/portal/datafeed/productfeed_en_v3.json` (HTTP 200, 200 834 809 B, lejupielādēts /tmp, nekas nerakstīts DB). Cenu feed (`PF_FEED_TOKEN`) šoreiz netika lasīts.

**PIERĀDĪTS — divkrāsu identitāte zaudēta.** Feed `colors.color` satur 2 krāsas; `pf-concept-sync/index.ts:121-136` saglabā tikai `[0]`:
| SKU | feed krāsas | DB color_code |
|---|---|---|
| K10588JC | H_GREY+BLACK (Heather grey / Black) | H_GREY |
| K1058B2C | H_GREY+ROYAL | H_GREY |
| K1058B3C | H_GREY+L_PINK | H_GREY |
| K1058B4C | H_GREY+BOTTLE | H_GREY |
| K1058B5C | H_GREY+GARNET | H_GREY |
| K1058B6C | H_GREY+RED | H_GREY |
| K1058B7E/G/J | H_GREY+PURPLE | H_GREY |
| 10650504 | BLACK+SILVER | BLACK |
| 10650503 | Steel+GOLD | (nav pārbaudīts DB) |

**PIERĀDĪTS — novecojuši SKU DB:** `K1058B7C` un `10650500` pašreizējā feed NAV; DB tie palikuši, jo sync tikai upsert pēc `item_code`, nekad nedeaktivē. Tātad 106505 BLACK konflikts = novecojis 10650500 + 10650504 (BLACK+SILVER).

**Cenu posmi (nejaukt):** PF bāzes cena `pf_prices.price`: 10650500 = 53,99 (list 69,21), 10650504 = 79,44; K1058 = 8,74 / 9,17. Normalizētā neto = ×1,65 (53,99→89,08; 79,44→131,08; 8,74→14,42; 9,17→15,13); publiski +21% PVN. Iepriekšējā ziņojumā 89,08/131,08 un 53,99/79,44 bija dažādi posmi.

**Sagatavots (nav ieviests sync):** `src/lib/pfColors.ts` `pfVariantColor` (kompozīta atslēga `H_GREY+ROYAL`, apraksts „Heather grey / Royal blue”, primārais hex) + 4 testi.
**Pilnam labojumam vajag (nav izdarīts, prasa DB/sync apstiprinājumu):** (1) sync izmanto `pfVariantColor`; (2) vienreizējs `pf_variants.color_code` pārrēķins no feed + rollback snapshot; (3) feed-trūkstošo SKU deaktivēšana (nevis dzēšana); (4) `catalog_items.colors`/`catalog_variant_prices` PF krāsu atslēgas un `pf_images` krāsu sasaiste jāpārbauda ar jauno atslēgu, lai kartīte/foto/cena/piedāvājums lieto to pašu SKU; ×1,65 un bāzes cenas nemainās.

## PF variantu identitāte — sagatavots labojums 005 (2026-10-19, nav piemērots)
Skat. `docs/pending-migrations/005_pf_variant_identity/README.md`. Pilns feed (v3, 2026-10-18T13:40:28Z, sha256 d082a185…): 19674 SKU sakrīt, 994 atvecojušas (121 modelis pilnībā), 2259 SKU maina krāsas atslēgu uz divkrāsu. Dublēti krāsa+izmērs: 555 → 1; cenu konflikti 29 → 0; cenu izmaiņas saglabātām SKU 0; dzēšanas avota tabulās 0. Priekšskatījumā jau labots: saliktās atslēgas tikai precīzi; PF kartītes foto tikai precīzai SKU.
- 2026-10-19 13:50: 005 pārbāzēts uz 003 (definīcijas tiek lasītas izpildes laikā, aizsargi ar md5 kontrolkodiem), secība 003→004→005 un atcelšana 005→004→003. Pievienots piedāvājuma izvēles un preces loga labojums (`frontend.patch`): izolētajā kopijā tipu pārbaude un 225 testi izgāja. Nekas nav izpildīts datubāzē.
