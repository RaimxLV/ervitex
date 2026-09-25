import { motion, useReducedMotion } from "framer-motion";

type PageIntroProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  /** Slimmer banner for utility pages (e.g. the catalog) so products start higher. */
  compact?: boolean;
};

const PageIntro = ({ title, subtitle, eyebrow }: PageIntroProps) => {
  const reduceMotion = useReducedMotion();
  const words = title.split(" ");

  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      {/* Industrial weave texture — very fine dot lattice */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:radial-gradient(hsl(var(--primary-foreground))_0.55px,transparent_0.55px)] [background-size:14px_14px]" />
      {/* Depth: soft light falling from the left edge */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,hsl(var(--primary-foreground))_0%,transparent_38%,transparent_72%,hsl(var(--primary-foreground)/0.05)_100%)] opacity-[0.07]" />
      {/* Fine weave rotated 15deg, full width, fading out from right to the middle */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-y-[60%] -inset-x-[20%] opacity-[0.06] [background-image:repeating-linear-gradient(90deg,hsl(var(--primary-foreground))_0_1px,transparent_1px_8px),repeating-linear-gradient(0deg,hsl(var(--primary-foreground))_0_1px,transparent_1px_8px)]"
        style={{
          transform: "rotate(15deg)",
          maskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.55) 28%, rgba(0,0,0,0) 50%)",
          WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.55) 28%, rgba(0,0,0,0) 50%)",
        }}
      />

      {/* Hairline highlight along the bottom edge */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent_0%,hsl(var(--primary-foreground)/0.18)_35%,hsl(var(--primary-foreground)/0.18)_65%,transparent_100%)]" />

      <div className="container relative flex min-h-[160px] items-end py-7 md:min-h-[190px] md:py-8">
        <div className="grid w-full gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(280px,1.1fr)] md:items-end md:gap-12">
          <div className="min-w-0">
            {eyebrow && (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="mb-6 flex items-center gap-2.5"
              >
                <span className="h-[3px] w-4 shrink-0 bg-accent" aria-hidden />
                <span className="inline-flex border border-primary-foreground/20 px-3 py-1.5 font-heading text-[10px] font-bold uppercase text-primary-foreground/55">
                  {eyebrow}
                </span>
              </motion.div>
            )}

            <h1 className="flex flex-wrap gap-x-[0.24em] overflow-hidden font-heading text-3xl font-bold uppercase leading-[0.94] md:text-5xl">
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

          </div>
          {subtitle && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.28 }}
              className="relative"
            >
              {/* Registration-mark corner accents frame the text block */}
              <span aria-hidden className="absolute -left-3 -top-2 h-2.5 w-2.5 border-l border-t border-primary-foreground/25" />
              <span aria-hidden className="absolute -right-3 bottom-0 h-2.5 w-2.5 border-b border-r border-primary-foreground/25" />
              <p className="max-w-2xl text-base leading-relaxed text-primary-foreground/55 md:pb-1">
                {subtitle}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PageIntro;