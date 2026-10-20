import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminOffers from "@/pages/admin/AdminOffers";

export const Route = createFileRoute("/offers/")({
  head: () => pageHead("/offers", { title: "Piedāvājumi | Ervitex", desc: "Ervitex projektu vadītāju piedāvājumu saraksts.", noindex: true }),
  component: () => (
    <ProtectedRoute>
      <AdminOffers />
    </ProtectedRoute>
  ),
});
