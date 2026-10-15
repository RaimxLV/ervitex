import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import TermsPage from "@/pages/TermsPage";

export const Route = createFileRoute("/terms")({
  head: () => pageHead("/terms"),
  component: TermsPage,
});
