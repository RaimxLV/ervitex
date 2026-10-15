import { createFileRoute } from "@tanstack/react-router";
import AssignPage from "@/pages/AssignPage";

export const Route = createFileRoute("/nodot/$token")({
  component: AssignPage,
});
