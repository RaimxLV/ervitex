import type { ComponentType } from "react";
import {
  Ban,
  Brush,
  Droplets,
  Layers,
  Lock,
  Palette,
  Recycle,
  Scissors,
  Shirt,
  Snowflake,
  Sparkles,
  Sun,
  Thermometer,
  TriangleAlert,
  WashingMachine,
  Wind,
} from "lucide-react";

export type GlyphProps = { className?: string; strokeWidth?: number };

const Svg = ({
  children,
  className,
  strokeWidth = 1.9,
}: GlyphProps & { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

/** Gludeklis — lucide neatbilstošu ikonu trūkuma dēļ zīmēts pašam. */
export const Iron = (p: GlyphProps) => (
  <Svg {...p}>
    <path d="M3 18h18" />
    <path d="M4.6 18c.3-5 3.8-8 9-8h4.1a2.3 2.3 0 0 1 2.3 2.3V18" />
    <path d="M8.3 10 7.5 7a1.6 1.6 0 0 1 1.6-2h5.1" />
  </Svg>
);

export const IronBan = (p: GlyphProps) => (
  <Svg {...p}>
    <path d="M4.6 18c.3-5 3.8-8 9-8h4.1a2.3 2.3 0 0 1 2.3 2.3V18" />
    <path d="M3 18h18" />
    <path d="M4 4l16 16" />
  </Svg>
);

/** Ķīmiskā tīrīšana — aplis ar “P”, kā marķējumos. */
export const DryClean = (p: GlyphProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.2" />
    <path d="M9.6 15.6V8.6h3.1a2.3 2.3 0 0 1 0 4.6H9.6" />
  </Svg>
);

export const DryCleanBan = (p: GlyphProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.2" />
    <path d="M9.6 15.6V8.6h3.1a2.3 2.3 0 0 1 0 4.6H9.6" />
    <path d="M4 4l16 16" />
  </Svg>
);

/** Tritaplis (nebalināt) ar svītru. */
export const BleachBan = (p: GlyphProps) => (
  <Svg {...p}>
    <path d="M12 4.8 20.4 19.4H3.6Z" />
    <path d="M4.6 5.2 19.4 19.2" />
  </Svg>
);

/** Veļas žāvētava — trompešs aplis korpusā. */
export const TumbleDry = (p: GlyphProps) => (
  <Svg {...p}>
    <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="3" />
    <circle cx="12" cy="13.2" r="4.4" />
    <path d="M7 6.4h2.4" />
  </Svg>
);

/** Pakarams — žāvēšana gaisā / horizontāli. */
export const Hanger = (p: GlyphProps) => (
  <Svg {...p}>
    <path d="M12 8.2V7.1A2.1 2.1 0 1 1 14.1 9.2" />
    <path d="M12 8.2 4.6 14.4a1.5 1.5 0 0 0 .9 2.7h13a1.5 1.5 0 0 0 .9-2.7L12 8.2Z" />
  </Svg>
);

const RULES: { test: RegExp; icons: ComponentType<GlyphProps>[]; ban?: boolean }[] = [
  { test: /((glud|iron|pres[ēe]).{0,25}(druk|print|appli|transfer|sublim|flex))|((druk|print|appli|transfer|sublim|flex).{0,25}(glud|iron|pres[ēe]))/, icons: [IronBan, Brush], ban: true },
  { test: /negludin|nedr[īi]kst gludin|no iron|do not iron|nespied|gludin[āa]t aiz|nedr[īi]kst glab|glab[āa]t glude|gludek|aizlieg.*gludin/, icons: [IronBan, Iron, TriangleAlert], ban: true },
  { test: /apgriezt|uzgriezt| otrādi|inside out|ārd|ārā puse/, icons: [Shirt, Layers] },
  { test: /nebalin|balin|bleach|hlora|peroksid|no bleach/, icons: [BleachBan, Ban, TriangleAlert], ban: true },
  { test: /nevar žāvēt veļas|veļas žāvētav|nedr[īi]kst žāvēt|mazgāšanas žāvē|tumble|dryer|nerotary|nerot/, icons: [TumbleDry, Wind, Ban], ban: true },
  { test: /neķīmisk|nedr[īi]kst ķīmisk|no dry clean|aizlieg.*ķīmisk|saus[āa] tīr[īi]\s*nav/, icons: [DryCleanBan, DryClean, Ban], ban: true },
  { test: /ķīmisk|saus[āa] tīr[īi]|dry clean|tetrahlor|perhlor/, icons: [DryClean, Sparkles] },
  { test: /druk|appli|transfer|sublim|flex|print/, icons: [Brush, Sparkles] },
  { test: /aiztais|ra[ēe]vējslēdz|r[āa]vējslēdz|knied|poga|kāvel|velcro|liplent|aizdari|nosedz|atsegs|noseg/, icons: [Lock, Layers] },
  { test: /līdzīg[āa]s krās|atsevišķ|cit[āa]s krās|pretkrās|nokrāso|krāsas atdal|dye|color run|tumš|gaiš|sviest|sveiciņ|spot|traipu/, icons: [Palette, Droplets, Snowflake] },
  { test: /snag|velk|cirkul|maig|delic|smalk|puff|burbul|triilot|velcro pirms|izš|apdrukas lauk|nepiecieš|p[āa]rbaud|nodil|berz|assort/, icons: [Scissors, Snowflake, Layers] },
  { test: /temperatūr|°|gr[āa]d|auksts|cold|silts|karst|40|30|60/, icons: [Thermometer, Droplets, Snowflake] },
  { test: /gais|horizont|pakab|izklāj|žāvē|dry flat|hang|nožāvē|izžāvē|mitrum|nodzēst|dzest/, icons: [Hanger, Wind, Sun] },
  { test: /saules|tieš|ultraviolet|sun|balin[āa]s/, icons: [Sun, Thermometer] },
  { test: /pārstrād|recycl|ogr|vide|ilgtsp|eko|organ|bioni|GOTS|GRS/, icons: [Recycle, Sparkles] },
  { test: /mitr|ūden|humid|water|sviedr|liet|jūra|basein|sāls|hlor/, icons: [Droplets, Thermometer] },
  { test: /mazg|wash|skalo|apakšveļ|maig[āa]s cikls|ieviet|maisin/, icons: [WashingMachine, Shirt, Droplets] },
  { test: /glud|glab[āa]t|dzelzs|iron|presē/, icons: [Iron, Thermometer] },
  { test: /nedr[īi]kst|aizlieg|nepieļauj|don'?t|do not|never|^no\s|nedrīkst|nav atļauts/, icons: [Ban, TriangleAlert], ban: true },
];

/** Ikona, kas der teksta jēgai un vēl nav aizņemta šajā sarakstā. */
export const assignCareIcons = (
  clauses: string[],
): { text: string; Icon: ComponentType<GlyphProps>; ban: boolean }[] => {
  const used = new Set<ComponentType<GlyphProps>>();
  const pool: ComponentType<GlyphProps>[] = [
    WashingMachine, Iron, IronBan, Hanger, TumbleDry, DryClean, DryCleanBan, BleachBan,
    Palette, Lock, Scissors, Shirt, Thermometer, Sun, Wind, Droplets, Snowflake,
    Recycle, Sparkles, Brush, Layers, TriangleAlert, Ban,
  ];

  return clauses.map((text) => {
    const t = text.toLowerCase();
    const rule = RULES.find((r) => r.test.test(t));
    const candidates = rule ? rule.icons : pool;
    const Icon = candidates.find((c) => !used.has(c)) ?? candidates[0];
    used.add(Icon);
    return { text, Icon, ban: !!rule?.ban };
  });
};
