import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import PrivacyPage from "@/pages/PrivacyPage";

export const Route = createFileRoute("/privacy")({
  head: () => pageHead("/privacy"),
  component: PrivacyPage,
});
