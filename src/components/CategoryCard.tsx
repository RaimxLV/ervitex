import { Link } from "react-router-dom";
import type { Category } from "@/data/products";

const CategoryCard = ({ category }: { category: Category }) => {
  return (
    <Link
      to={`/catalog?category=${category.id}`}
      className="group relative block overflow-hidden rounded-lg"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
      <div className="absolute bottom-0 left-0 p-5">
        <h3 className="font-heading text-xl font-semibold text-background">{category.name}</h3>
        <p className="mt-1 text-sm text-background/70">{category.productCount} products</p>
      </div>
    </Link>
  );
};

export default CategoryCard;
