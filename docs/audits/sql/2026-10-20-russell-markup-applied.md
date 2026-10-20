# Russell ×1,70 — root izpildītais ražošanas labojums (2026-10-20)

Statuss: **IZPILDĪTS ražošanā (root)**. Šis fails tikai dokumentē; SQL atkārtoti NEIZPILDĪT.

## Avota pierādījumi
- 93/93 Russell modeļiem `ru_prices.wholesale_price = ru_prices.retail_price = ru_styles.raw.price` (iepirkuma bāze).
- Pirms izmaiņām visas 93 publiskās cenas sakrita ar veco formulu `ROUND(bāze × 1,65, 2)`.

## Izmaiņas
1. `catalog_variant_prices` (source='ru'): 93 rindas → `ROUND(wholesale_price × 1,70, 2)`.
2. `catalog_price_ranges` (source='ru'): pārrēķināti no 1.
3. `public.refresh_catalog_prices()`: viena izteiksme `p.retail_price * 1.65` → `p.retail_price * 1.70` (Russell zarā), lai nakts atjaunošana neatgriež veco uzcenojumu.
4. Atcelšanas momentuzņēmums: `ervitex_private_audit.russell_markup_20261020` (REVOKE no PUBLIC/anon/authenticated).

Pēc izmaiņām: 93/93 atbilst jaunajai formulai.

## Ko NEMAINĪJA
- Malfini cenas — gaida parastās vs akcijas/outlet cenas pierādījumus.
- Noraidītais plašais pārrēķina SQL nav un netiks izmantots.

## Atlikušās 1,65 vietas (pārbaudīts)
- Frontendā Russell 1,65 rezerves vērtības nav (`AdminPriceAudit` rāda ×1,70).
- `1.65` ru zarā paliek tikai vēsturiskajās migrācijās `0000/0001/0003/0005` — tās ir aizvietotas ar vēlākām definīcijām un netiek mainītas.
- `private.price_audit_expected()` RU ×1,70 jau migrācijā `0023`.
- PF `× 1,65` ir cita piegādātāja formula — nemainīt.
