import { createFileRoute, redirect } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/services")({
  head: () => pageHead("/services"),
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "tehnologijas", replace: true });
  },
});
