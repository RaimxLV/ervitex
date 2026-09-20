# NWG sinhronizācijas pastāvīgs remonts

## Mērķis
Panākt, lai NWG katalogs un Ervitex līgumcenas atjaunojas automātiski bez atkārtotas lietotājvārda vai paroles prasīšanas un bez iestrēgušiem procesiem.

## Darbi
1. Apvienot NWG autentifikāciju vienā servera puses modulī un datubāzes stāvoklī, ko izmanto gan katalogs, gan cenu sinhronizācija.
2. Pāriet uz pareizo Finland veikala OAuth kontekstu un droši saglabāt rotējošos access/refresh tokenus ar atomisku bloķēšanu pret paralēlu izmantošanu.
3. Saglabāt esošo ilgtermiņa Gateway API atslēgu kā kataloga rezerves ceļu, nevis kļūdaini izmantot to klienta līgumcenām.
4. Salabot deterministisku NWG produktu lapošanu (`order by product_number`) un cenu mērķu lapošanu, lai SKU netiktu izlaisti vai apstrādāti atkārtoti.
5. Pievienot automātisku atkopšanos pēc pārtraukta darba: īsas leases, watchdog un skaidri pabeigti/kļūdas statusi.
6. Izvietot funkcijas un pārbaudīt pilnu ķēdi: autorizācija, viena reāla līgumcena, cenu batch, kataloga batch, cenu pārrēķins un sync žurnāli.
7. Veikt NWG datu neatbilstību auditu: SKU bez cenas, modeļi bez kategorijas/attēla, arhivēti aktīvi modeļi, dublikāti un novecojušas cenas.

## Tehniskās detaļas
- Mainām tikai NWG backend funkcijas, migrācijas/cron konfigurāciju un admina veselības diagnostiku.
- Akreditācijas dati netiks rakstīti kodā, žurnālos vai klienta pusē.
- Cena paliek pēc esošās formulas: Ervitex iepirkuma cena × 1.65, PVN tiek piemērots esošajā kataloga cenu slānī.
- Destruktīva arhivēšana nenotiks, kamēr aktīvā kataloga pārklājums nav droši apstiprināts.
