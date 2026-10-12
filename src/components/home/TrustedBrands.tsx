import { brandLogos } from "@/lib/brandLogos";
import { useLanguage } from "@/i18n/LanguageContext";
const TrustedBrands = () => {
  const { lang } = useLanguage();
  return (
    <section aria-label={lang === "lv" ? "Ražotāji" : "Manufacturers"} className="brand-marquee border-y border-border bg-catalog-card-media py-7 md:py-10">
      <div className="container">
        <div className="overflow-hidden">
          <div className="brand-marquee-track flex w-max">
            {[0, 1].map((setIdx) => (
              <div key={setIdx} aria-hidden={setIdx === 1 ? true : undefined} className="flex shrink-0 items-center">
                {brandLogos.map((brand) => (
                  <div key={`${setIdx}-${brand.name}`} className="mx-7 flex h-12 w-28 shrink-0 items-center justify-center md:mx-10 md:h-14 md:w-36">
                    <img src={brand.src} alt={setIdx === 0 ? brand.name : ""} title={brand.name} loading="lazy" decoding="async" className="h-full w-full object-contain" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
export default TrustedBrands;
