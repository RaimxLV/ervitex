import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import PfConceptPage from "@/pages/PfConceptPage";

export const Route = createFileRoute("/pf-concept")({
  head: () => pageHead("/pf-concept"),
  component: PfConceptPage,
});
