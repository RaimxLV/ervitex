import { motion, useReducedMotion } from "framer-motion";

type PageIntroProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  /** Slimmer banner for utility pages (e.g. the catalog) so products start higher. */
  compact?: boolean;
};

const PageIntro = ({ title, subtitle, eyebrow, compact }: PageIntroProps) => {
  const reduceMotion = useReducedMotion();
  const words = title.split(" ");

  return (
    <section
      className={
        compact
          ? "relative overflow-hidden bg-primary text-primary-foreground"
          : "relative overflow-hidden bg-primary text-primary-foreground"
      }
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(hsl(var(--primary-foreground))_0.7px,transparent_0.7px)] [background-size:12px_12px]" />
      <div className={`container relative flex ${compact ? "min-h-[160px] items-end py-9 md:min-h-[190px] md:py-11" : "min-h-[290px] items-end py-12 md:min-h-[360px] md:py-16"}`}>
        <div className="grid w-full gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="max-w-3xl">
            {eyebrow && (
              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="mb-6 inline-flex border border-primary-foreground/20 px-3 py-1.5 font-heading text-[10px] font-bold uppercase text-primary-foreground/55"
              >
                {eyebrow}
              </motion.p>
            )}

            <h1 className={`flex flex-wrap gap-x-[0.24em] overflow-hidden font-heading font-bold uppercase leading-[0.94] ${compact ? "text-3xl md:text-5xl" : "text-4xl md:text-6xl lg:text-7xl"}`}>
              {words.map((word, wordIndex) => (
                <span key={`${word}-${wordIndex}`} className="overflow-hidden pb-1">
                  <motion.span
                    className="inline-block"
                    initial={reduceMotion ? false : { y: "115%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, delay: wordIndex * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>

            {subtitle && (
              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.28 }}
                className={`mt-7 max-w-2xl text-base leading-relaxed text-primary-foreground/55 md:text-lg ${compact ? "md:mt-5" : ""}`}
              >
                {subtitle}
              </motion.p>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default PageIntro;