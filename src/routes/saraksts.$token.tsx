import { createFileRoute } from "@tanstack/react-router";
import { privateHead } from "@/lib/seo";
import WorksheetPage from "@/pages/WorksheetPage";

export const Route = createFileRoute("/saraksts/$token")({
  head: () => privateHead(),
  component: WorksheetPage,
});
