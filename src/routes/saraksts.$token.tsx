import { createFileRoute } from "@tanstack/react-router";
import WorksheetPage from "@/pages/WorksheetPage";

export const Route = createFileRoute("/saraksts/$token")({
  component: WorksheetPage,
});
