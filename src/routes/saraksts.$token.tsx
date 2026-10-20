import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import WorksheetPage from "@/pages/WorksheetPage";

export const Route = createFileRoute("/saraksts/$token")({
  head: () => pageHead("/saraksts", { title: "Preču saraksts | Ervitex", desc: "Ervitex pieprasījuma preces, apdruka un apstiprinātās saraksta versijas.", noindex: true }),
  component: WorksheetPage,
});
