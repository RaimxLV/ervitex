import planImage from "@/assets/karteervitex.webp";
import { useLanguage } from "@/i18n/LanguageContext";

const HausmanaKvartalsMap = ({ className = "h-[320px] sm:h-[420px]" }: { className?: string }) => {
  const { lang } = useLanguage();
  return (
    <img
      src={planImage}
      alt={lang === "lv" ? "Hausmaņa biroju plāns ar iezīmētu Ervitex ieeju" : "Hausmana offices plan with the Ervitex entrance marked"}
      width={1400}
      height={848}
      className={`w-full bg-card object-contain p-4 ${className}`}
      loading="lazy"
      decoding="async"
    />
  );
};

export default HausmanaKvartalsMap;
