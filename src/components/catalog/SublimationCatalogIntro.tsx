import { Activity, Palette, Shirt, Users } from "lucide-react";
import { AccentIcon } from "@/components/ui/accent-icon";

type SublimationCatalogIntroProps = {
  lang: "lv" | "en";
};

const content = {
  lv: {
    eyebrow: "Ražots Latvijā",
    title: "Pilnībā personalizētu apģērbu izgatavošana",
    lead: 'SIA "Ervitex" piedāvā izgatavot pilnībā personalizētus tekstilizstrādājumus, pielāgotus jūsu komandai, uzņēmumam vai biznesam.',
    printTitle: "Sublimācijas apdruka bez dizaina ierobežojumiem",
    print: "Sublimācijas produktu ražošana un apdruka ietver ne vien logo un klasiskās informācijas uzdrukāšanu, bet arī paša izstrādājuma fona krāsas vai fona dizaina veidošanu. Līdz ar to šajā tehnikā izstrādājumiem nav nekādu krāsu vai dizaina ierobežojumu.",
    made: "Šajā tehnikā izgatavojam",
    items: [
      { icon: Users, title: "Sporta formas komandām", text: "Basketbola, futbola, volejbola, pludmales volejbola un florbola formas" },
      { icon: Activity, title: "Aktīvās atpūtas apģērbus", text: "Skriešanas, maratonu un orientēšanās kreklus" },
      { icon: Shirt, title: "Citus tekstilizstrādājumus", text: "T-kreklus un speciāli pielāgotus izstrādājumus" },
    ],
  },
  en: {
    eyebrow: "Made in Latvia",
    title: "Fully personalised garment production",
    lead: "Ervitex produces fully personalised textile items tailored to your team, company or business.",
    printTitle: "Sublimation printing without design limits",
    print: "Sublimated product production and printing includes not only applying a logo and standard information, but also creating the product's own background colour or background design. As a result, items made with this technique have no colour or design limitations.",
    made: "In this technique we produce",
    items: [
      { icon: Users, title: "Team sports kits", text: "Basketball, football, volleyball, beach volleyball and floorball uniforms" },
      { icon: Activity, title: "Activewear", text: "Running, marathon and orienteering shirts" },
      { icon: Shirt, title: "Other textile products", text: "T-shirts and specially customised items" },
    ],
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
            <ul className="mt-5 grid gap-y-5">
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default SublimationCatalogIntro;
