import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/data/products";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.new && (
          <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground">New</Badge>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-body text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="flex flex-wrap gap-1 pt-1">
          {product.colors.slice(0, 4).map((color) => (
            <span key={color} className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {color}{product.colors.indexOf(color) < Math.min(product.colors.length, 4) - 1 ? " ·" : ""}
            </span>
          ))}
          {product.colors.length > 4 && (
            <span className="text-[10px] text-muted-foreground">+{product.colors.length - 4}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
