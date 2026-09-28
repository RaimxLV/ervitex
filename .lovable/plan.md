# PF Concept un NWG sinhronizācijas remonts

## Mērķis
Panākt, lai PF Concept cenas atjaunojas pilnā apjomā bez laika limita kļūdas un NWG vairs neprasa manuāli mainīt nemainītus pieejas datus.

## Darbi
1. PF cenu failu sadalīt mazākās, droši atsākamās daļās un katru nākamo daļu palaist neatkarīgi, līdz viss fails pabeigts.
2. PF saglabāt progresa stāvokli un korekti pabeigt iestrēgušos ierakstus, lai administrācijā nav mūžīga “darbojas” statusa.
3. NWG autorizācijai izmantot jau saglabāto lietotājvārdu un paroli, lai sistēma pati atjauno pieeju; manuālu refresh token lauku vairs nerādīt kā ikdienas risinājumu.
4. NWG brīdinājumu balstīt pašreizējā pārbaudē, nevis vecā kļūdas ierakstā; atsevišķi rādīt kataloga un līgumcenu stāvokli.
5. Izvietot abas funkcijas, palaist kontrolētus testus un pārbaudīt datubāzē, ka cenas un pēdējā veiksmīgā sinhronizācija tiešām atjaunojas.

## Drošība
Piekļuves dati paliek slepenajā glabātuvē un netiek rādīti lapā, žurnālos vai kodā.
