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
