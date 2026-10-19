import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminOfferEdit from "@/pages/admin/AdminOfferEdit";

export const Route = createFileRoute("/admin/offers/$id")({
  head: () => pageHead("/admin/offers", { title: "Piedāvājuma rediģēšana | Ervitex", desc: "Ervitex piedāvājuma preču un individuālo atlaižu pārvaldība.", noindex: true }),
  component: () => (
    <ProtectedRoute>
      <AdminOfferEdit />
    </ProtectedRoute>
  ),
});
