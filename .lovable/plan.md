# Sakārtot “Par Ervitex” depth-map ainu

## Izmaiņas
- Pilnībā noņemt peles lukturi, lampu mirgošanu, dzirksteles un tekošo pilienu efektus, ieskaitot nevajadzīgo kodu un stilus.
- Atstāt tikai tīru, mierīgu depth-map 2.5D kustību, kas reaģē uz lapas ritināšanu.
- Pārbūvēt ainas ietvaru tā, lai fons nepārtraukti nosegtu visu stāsta bloku, nevis tikai vienu ekrāna augstumu.
- Pielāgot attēla mērogu un fokusu datora, planšetes un telefona proporcijām, saglabājot salasāmu tekstu.
- Respektēt ierīces samazinātas kustības iestatījumu un apturēt nevajadzīgu nepārtrauktu renderēšanu.

## Pārbaude
- Pārbaudīt bloka sākumu, vidu un beigas ritināšanas laikā.
- Pārbaudīt datora, planšetes un telefona izmērus, attēla pārklājumu un teksta salasāmību.
- Pārbaudīt, ka nav palikuši vecie specefekti, vizuāli pārrāvumi vai konsoles kļūdas.

## Tehniskā pieeja
- Vienkāršot ainas komponenti līdz fona canvas, vienmērīgam kontrasta pārklājumam un saturam.
- Depth-map canvas novietot absolūti visā sekcijas laukumā; izmēru aprēķināt pēc faktiskā bloka, nevis `100vh`.
- WebGL ainu pārzīmēt tikai ritināšanas, izmēra maiņas un īsas izlīdzināšanas laikā, nevis bezgalīgi katrā kadrā.