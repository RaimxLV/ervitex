# Sinhronizēt ainas parallax un lukturi

## Izmaiņas
- Aizstāt pašreizējo ainas attēlu ar lietotāja augšupielādēto attēlu.
- Fona un luktura izgaismoto attēlu renderēt ar pilnīgi vienādu izmēru, pozīciju un ritināšanas nobīdi.
- Saglabāt peles lukturi, lampu mirgošanu un dzirksteles, novēršot dubultā kadra efektu.
- Pārbaudīt ainu ritinot un kustinot peli gan datora, gan telefona izmērā.

## Tehniskā pieeja
- Attēlu glabāt projekta CDN kā vienu kopīgu resursu.
- Abiem vizuālajiem slāņiem izmantot vienu identisku absolūto ietvaru un CSS transformāciju.
- Parallax nobīdi turpināt vadīt tikai ar ritināšanu; peles kustība mainīs tikai luktura maskas centru.
