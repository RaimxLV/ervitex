import { Activity, Palette, Shirt, Sun, Trophy, Users } from "lucide-react";
import { AccentIcon } from "@/components/ui/accent-icon";

type SublimationCatalogIntroProps = {
  lang: "lv" | "en";
};

const content = {
  lv: {
    eyebrow: "Ražots Latvijā",
    title: "Pilnībā personalizētas sporta formas",
    lead: 'SIA "Ervitex" piedāvā augstākās kvalitātes, pilnībā personalizētu tekstilizstrādājumu ražošanu, kas īpaši pielāgota jūsu uzņēmuma, biznesa vai sporta komandas vajadzībām.',
    printTitle: "Sublimācijas apdruka — bez dizaina un krāsu ierobežojumiem",
    print: "Mūsu pamatvirziens ir sublimācijas apģērbu ražošana un apdruka. Atšķirībā no standarta metodēm, sublimācija ļauj ne tikai uzdrukāt uzņēmuma logo vai tekstu uz gatava apģērba, bet pilnībā radīt paša izstrādājuma fona krāsu un unikālu dizainu no nulles. Jūsu idejām nav krāsu, toņu pāreju vai dizaina ierobežojumu, turklāt druka ir elpojoša un nenomazgājama.",
    made: "Mēs izgatavojam",
    items: [
      { icon: Users, title: "Sporta formas komandām", text: "Basketbola, futbola, volejbola un florbola formas" },
      { icon: Activity, title: "Aktīvās atpūtas apģērbus", text: "Skriešanas, maratonu un orientēšanās kreklus" },
      { icon: Sun, title: "Vasaras sporta apģērbus", text: "Pludmales volejbola kreklus un topus" },
      { icon: Shirt, title: "Citus tekstilizstrādājumus", text: "T-kreklus un speciāla dizaina apģērbus jūsu zīmolam" },
    ],
    closing: "Izceliet savu komandu vai zīmolu ar unikālu vizuālo identitāti!",
  },
  en: {
    eyebrow: "Made in Latvia",
    title: "Fully personalised sportswear",
    lead: "Ervitex produces premium, fully personalised textile products tailored to the needs of your company, business or sports team.",
    printTitle: "Sublimation printing — without design or colour limits",
    print: "Our core specialisation is sublimated garment production and printing. Unlike standard methods, sublimation can create the complete background colour and an original design from scratch—not only add a logo or text to a finished garment. There are no limits on colours, gradients or design, while the print remains breathable and permanent.",
    made: "We produce",
    items: [
      { icon: Users, title: "Team sports kits", text: "Basketball, football, volleyball and floorball uniforms" },
      { icon: Activity, title: "Activewear", text: "Running, marathon and orienteering shirts" },
      { icon: Sun, title: "Summer sportswear", text: "Beach volleyball shirts and tops" },
      { icon: Shirt, title: "Other textile products", text: "T-shirts and custom-designed garments for your brand" },
    ],
    closing: "Give your team or brand a unique visual identity.",
  },
};

const SublimationCatalogIntro = ({ lang }: SublimationCatalogIntroProps) => {
  const copy = content[lang];

  return (
    <section className="border-b border-border bg-muted/40" aria-labelledby="sublimation-catalog-title">
      <div className="container px-4 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-accent" aria-hidden />
              <span className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-accent">{copy.eyebrow}</span>
            </div>
            <h2 id="sublimation-catalog-title" className="mt-4 max-w-xl font-heading text-2xl font-bold uppercase leading-tight text-foreground md:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{copy.lead}</p>

            <div className="mt-6 border-l-2 border-accent pl-4 md:pl-5">
              <div className="flex items-start gap-3">
                <AccentIcon icon={Palette} inline className="mt-0.5" />
                <div>
                  <h3 className="font-heading text-sm font-bold uppercase leading-snug text-foreground md:text-base">{copy.printTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.print}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:border-l lg:border-border lg:pl-10">
            <div className="flex items-center gap-3">
              <AccentIcon icon={Trophy} inline />
              <h3 className="font-heading text-sm font-bold uppercase text-foreground md:text-base">{copy.made}</h3>
            </div>
            <ul className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {copy.items.map(({ icon, title, text }) => (
                <li key={title} className="group flex items-start gap-3 border-t border-border pt-4">
                  <AccentIcon icon={icon} className="h-10 w-10" />
                  <div className="min-w-0">
                    <h4 className="font-heading text-sm font-bold text-foreground">{title}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-7 border-t border-border pt-5 font-heading text-base font-bold uppercase leading-snug text-foreground md:text-lg">
              {copy.closing}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SublimationCatalogIntro;