import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import OfferPage from "@/pages/OfferPage";

export const Route = createFileRoute("/piedavajums/$token")({
  head: () => pageHead("/piedavajums", { title: "Jūsu piedāvājums | Ervitex", desc: "Ervitex sagatavotais preču piedāvājums ar individuālām atlaidēm un kopsummu.", noindex: true }),
  component: OfferPage,
});
