import { createFileRoute } from "@tanstack/react-router";
import { privateHead } from "@/lib/seo";
import ManagerRequestPage from "@/pages/ManagerRequestPage";

export const Route = createFileRoute("/pieprasijums/$id")({
  ssr: false,
  head: () => ({
    meta: [
      ...privateHead("Pieprasījums — darbiniekiem | Ervitex").meta,
      { name: "description", content: "Ervitex pieprasījuma darba skats projektu vadītājiem." },
      { property: "og:title", content: "Pieprasījums — darbiniekiem | Ervitex" },
      { property: "og:description", content: "Ervitex pieprasījuma darba skats projektu vadītājiem." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: ManagerRequestPage,
});
