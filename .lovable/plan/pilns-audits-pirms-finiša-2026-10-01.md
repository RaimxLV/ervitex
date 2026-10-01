# Pilns audits pirms finiša

## Ko jau atradu (drošība — steidzami)

1. **KRITISKI: administratora konta pārņemšana.** Ir palikusi vecā palīgfunkcija, ko var izsaukt jebkurš internetā bez ielogošanās. Tā galvenā admina (ofsetadruka@gmail.com) paroli atiestata uz kodā ierakstītu paroli. Tā jāizdzēš uzreiz un parole jānomaina.
2. **Iepirkuma cenas redzamas publiski.** NWG variantu tabulā (iepirkuma cena, pārdošanas cena), Russell cenu tabulā (vairumcena) un vecajā produktu tabulā (vairumcena, S/S vairumcena) tās var nolasīt jebkurš. Atstāšu publiski tikai mazumtirdzniecības cenas.
3. **Iekšējās funkcijas pieejamas viesiem.** 9 iekšējās funkcijas var izsaukt bez ielogošanās, 13 — jebkurš ielogots lietotājs (cenu audits, sinhronizācijas, e-pastu rinda). Atstāšu publiskas tikai klienta saites funkcijas (saraksts, piedāvājums); pārējās tikai adminam vai serverim.
4. Pārējie ~15 brīdinājumi ir publisks katalogs (modeļi, bildes, krāsas, mazumtirdzniecības cenas, „Ir noliktavā”) — tas ir apzināti publisks. Tos atzīmēšu ar paskaidrojumu, nevis aizvēršu.

## Funkciju un admin paneļa pārbaude

Ielogojos kā admins un izeju cauri katrai sadaļai: Panelis, Piedāvājumi (izveide, apdruka, atlaide, saite), Pieprasījumi (piešķiršana, statusi, dzēšana, saraksts), Mūsu produkti, Kategorijas, Cenu audits, Mega izvēlne, Komandas foto, Lietotāji. Publiski: katalogs (filtri, meklēšana, krāsas/cenas), preces skats, pieprasījuma nosūtīšana ar rekvizītiem, klienta saraksts, piedāvājuma lapa, kontakti. Katru kļūdu salaboju tajā pašā reizē.

## Dizains visās ierīcēs

Visas lapas fotografēšu 390, 768, 1280, 1920 px platumā: nogriezti teksti, pārplūdes uz sāniem, pārklājumi, mazas pogas. Labošu atrastās vietas, nemainot apstiprināto stilu.

## Ātrdarbība

- Izmērīšu katras lapas ielādi un ritināšanu (sākumlapa ar 3D, katalogs, preces skats).
- Noņemšu `no-cache/no-store` iestatījumus, kas liek pārlūkam katru reizi visu lādēt no jauna.
- Izdzēsīšu dublēto un neizmantoto vecā pārlūka kešatmiņas skriptu un neizmantotos lielos attēlus/failus.
- Pārbaudīšu, vai bildes ārpus ekrāna lādējas tikai, kad vajag.

## SEO (bez Google ieslēgšanas)

- Atstāšu meklētājiem aizliegumu (`noindex` un `robots.txt` bloķēšana), līdz tu saki „ieslēdzam” — tad tas ir viens slēdzis.
- Sagatavošu visu pārējo: latviski precīzs virsraksts un apraksts, sociālo tīklu priekšskatījums, uzņēmuma dati (SIA Ervitex, adrese, tālrunis, darba laiks) meklētājiem saprotamā formā, katras lapas virsraksts un apraksts, kanoniskās saites, lapu karte (`sitemap.xml`) uz `raimxlv.github.io/ervitex`, attēlu alt teksti, viens H1 katrā lapā.

## Rezultāts

Īss audita ziņojums Failos: kas atrasts, kas salabots, kas palicis ar iemeslu.

## Tehniskās detaļas

- Dzēst edge funkciju `create-super-admin` (deploy delete + mape); ieteikt paroles maiņu.
- Migrācija: `nwg_skus` publiskā SELECT aizstāt ar `security_invoker` skatu bez `purchase_*`/`sales_price`, vai kolonnu GRANT tikai drošajām kolonnām; tāpat `ru_prices.wholesale_price`, `products.wholesale_price/ss_wholesale_price` (anon/authenticated kolonnu GRANT). Pārbaudīt `nwg_styles.raw`/`ss_styles.raw` uz cenām.
- `REVOKE EXECUTE ... FROM anon, authenticated` iekšējām SECURITY DEFINER funkcijām; atstāt `get_quote_worksheet*`, `get_pm_offer`, `save/confirm/discard_quote_worksheet*` anon; admin RPC iekšēji pārbauda `has_role`.
- `index.html`: noņemt `http-equiv` no-cache; JSON-LD `Organization`/`LocalBusiness`; per-route `document.title`/description hook; `public/sitemap.xml`; `robots`/`noindex` paliek līdz atļaujai.
- Dzēst `public/sw.js`/`service-worker.js` dublikātu (cleanup skripts paliek).
- Playwright skripti `/tmp/browser/audit/` ar mintēto admina sesiju.
