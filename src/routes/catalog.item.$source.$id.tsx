import { createFileRoute } from "@tanstack/react-router";
import CatalogItemPage from "@/pages/CatalogItemPage";
import { catalogItemHead, loadCatalogItemSeo } from "@/lib/catalogItemSeo";

export const Route = createFileRoute("/catalog/item/$source/$id")({
  loader: ({ params }) => loadCatalogItemSeo(params.source, params.id),
  head: ({ loaderData }) => catalogItemHead(loaderData),
  component: CatalogItemPage,
});
