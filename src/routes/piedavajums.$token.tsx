import { createFileRoute } from "@tanstack/react-router";
import { privateHead } from "@/lib/seo";
import OfferPage from "@/pages/OfferPage";

export const Route = createFileRoute("/piedavajums/$token")({
  head: () => privateHead(),
  component: OfferPage,
});
