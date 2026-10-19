import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminOfferEdit from "@/pages/admin/AdminOfferEdit";

export const Route = createFileRoute("/offers/$id")({
  head: () => pageHead("/offers", { title: "Piedāvājuma veidošana | Ervitex", desc: "Ervitex piedāvājuma preces, atlaides un klienta informācija.", noindex: true }),
  component: () => (
    <ProtectedRoute>
      <AdminOfferEdit />
    </ProtectedRoute>
  ),
});
