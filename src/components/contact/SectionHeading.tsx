import type { ReactNode } from "react";

type Props = { eyebrow: string; title: string; subtitle?: ReactNode; align?: "left" | "center" };

/** Single heading style shared by every contact page section. */
const SectionHeading = ({ eyebrow, title, subtitle, align = "left" }: Props) => (
  <div className={`mb-7 md:mb-10 ${align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
    <div className={`mb-3 flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}>
      <span className="h-px w-8 bg-accent" />
      <span className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-accent">{eyebrow}</span>
    </div>
    <h2 className="font-heading text-xl font-bold uppercase leading-tight text-foreground sm:text-2xl md:text-3xl">{title}</h2>
    {subtitle && <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{subtitle}</p>}
  </div>
);

export default SectionHeading;
