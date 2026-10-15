import { createFileRoute } from "@tanstack/react-router";
import PfConceptPage from "@/pages/PfConceptPage";

export const Route = createFileRoute("/pf-concept")({
  component: PfConceptPage,
});
