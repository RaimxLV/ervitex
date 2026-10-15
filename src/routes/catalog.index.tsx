import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import CatalogPage from "@/pages/CatalogPage";

export const Route = createFileRoute("/catalog/")({
  head: () => pageHead("/catalog"),
  component: CatalogPage,
});
