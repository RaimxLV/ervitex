import { createFileRoute } from "@tanstack/react-router";
import OfferPage from "@/pages/OfferPage";

export const Route = createFileRoute("/piedavajums/$token")({
  component: OfferPage,
});
