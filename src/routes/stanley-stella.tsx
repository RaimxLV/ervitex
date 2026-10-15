import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import StanleyStellaPage from "@/pages/StanleyStellaPage";

export const Route = createFileRoute("/stanley-stella")({
  head: () => pageHead("/stanley-stella"),
  component: StanleyStellaPage,
});
