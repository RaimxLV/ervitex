import { createFileRoute } from "@tanstack/react-router";
import { privateHead } from "@/lib/seo";
import AssignPage from "@/pages/AssignPage";

export const Route = createFileRoute("/nodot/$token")({
  head: () => privateHead(),
  component: AssignPage,
});
