import { createFileRoute } from "@tanstack/react-router";
import CatalogItemPage from "@/pages/CatalogItemPage";
import { catalogItemHead, loadCatalogItemSeo } from "@/lib/catalogItemSeo";

export const Route = createFileRoute("/catalog/item/$source/$id")({
  // Search engines receive server-rendered facts; in-app clicks open the page immediately.
  loader: ({ params }) => (import.meta.env.SSR ? loadCatalogItemSeo(params.source, params.id) : null),
  head: ({ loaderData }) => catalogItemHead(loaderData),
  component: CatalogItemPage,
});
