import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Category } from "@/data/products";

const CategoryCard = ({ category }: { category: Category }) => {
  const { lang } = useLanguage();

  return (
    <Link
      to={`/catalog?category=${category.id}`}
      className="group relative block overflow-hidden rounded-sm"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={category.image}
          alt={category.name[lang]}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent transition-opacity group-hover:from-foreground/95" />
      <div className="absolute bottom-0 left-0 p-5">
        <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-background">{category.name[lang]}</h3>
        <p className="mt-1 text-xs text-background/60">{category.productCount} {lang === "lv" ? "produkti" : "products"}</p>
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-accent transition-all duration-500 group-hover:w-full" />
    </Link>
  );
};

export default CategoryCard;
