import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminDashboard from "@/pages/admin/AdminDashboard";
export const Route = createFileRoute("/admin/overview")({
  head: () => pageHead("/admin/overview", { title: "Katalogu pārskats | Ervitex", desc: "Ervitex katalogu pārskats un sinhronizācija.", noindex: true }),
  component: () => <ProtectedRoute><AdminDashboard /></ProtectedRoute>,
});
