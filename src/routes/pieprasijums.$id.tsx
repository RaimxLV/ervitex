import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import ManagerRequestPage from "@/pages/ManagerRequestPage";

export const Route = createFileRoute("/pieprasijums/$id")({
  head: () => pageHead("/pieprasijums", { title: "Pieprasījums — darbiniekiem | Ervitex", desc: "Ervitex pieprasījuma darba skats projektu vadītājiem.", noindex: true }),
  component: ManagerRequestPage,
});
