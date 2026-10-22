import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminCategories from "@/pages/admin/AdminCategories";

export const Route = createFileRoute("/admin/categories")({
  head: () => pageHead("/admin/categories", { title: "Kategoriju pārvaldība | Ervitex", desc: "Ervitex administratora kategoriju rediģēšana un secības pārvaldība.", noindex: true }),
  component: () => (
    <ProtectedRoute>
      <AdminCategories />
    </ProtectedRoute>
  ),
});
