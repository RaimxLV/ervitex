import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Product } from "@/data/products";

const ProductCard = ({ product }: { product: Product }) => {
  const { lang, t } = useLanguage();

  return (
    <div className="group">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-sm bg-muted">
          <img
            src={product.images[0]}
            alt={product.name[lang]}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {product.new && (
            <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground font-heading text-[10px] uppercase tracking-widest">
              {t("product.new")}
            </Badge>
          )}
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground group-hover:text-accent transition-colors">
            {product.name[lang]}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{product.description[lang]}</p>
          <div className="flex flex-wrap gap-1 pt-1">
            {product.colors.slice(0, 3).map((color) => (
              <span key={color} className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {color}{product.colors.indexOf(color) < Math.min(product.colors.length, 3) - 1 ? " ·" : ""}
              </span>
            ))}
            {product.colors.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{product.colors.length - 3}</span>
            )}
          </div>
        </div>
      </Link>
      <Button variant="outline" size="sm" className="mt-3 w-full border-foreground/20 text-xs uppercase tracking-wider hover:bg-accent hover:text-accent-foreground hover:border-accent" asChild>
        <Link to={`/contact?product=${product.id}`}>
          {t("catalog.quoteBtn")} <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </Button>
    </div>
  );
};

export default ProductCard;
