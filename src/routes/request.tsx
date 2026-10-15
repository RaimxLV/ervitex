import { createFileRoute } from "@tanstack/react-router";
import RequestPage from "@/pages/RequestPage";

export const Route = createFileRoute("/request")({
  component: RequestPage,
});
