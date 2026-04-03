import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Package, MessageSquare, LogOut, LayoutDashboard, FolderTree } from "lucide-react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/categories", icon: FolderTree, label: "Categories" },
  { to: "/admin/quotes", icon: MessageSquare, label: "Quotes" },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 w-64 border-r border-border bg-card">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link to="/" className="font-heading text-lg font-black uppercase tracking-wider text-accent">
            Ervitex
          </Link>
          <span className="ml-2 rounded-sm bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">Admin</span>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <p className="mb-2 truncate text-xs text-muted-foreground">{user?.email}</p>
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={handleSignOut}>
            <LogOut className="mr-2 h-3 w-3" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
