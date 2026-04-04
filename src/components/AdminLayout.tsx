import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Package, MessageSquare, LogOut, LayoutDashboard, FolderTree, Users, Menu, X } from "lucide-react";

const SUPER_ADMIN_EMAIL = "ofsetadruka@gmail.com";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Galvenais panelis" },
  { to: "/admin/products", icon: Package, label: "Produkti" },
  { to: "/admin/categories", icon: FolderTree, label: "Kategorijas" },
  { to: "/admin/quotes", icon: MessageSquare, label: "Cenu pieprasījumi" },
  { to: "/admin/users", icon: Users, label: "Lietotāji", superOnly: true },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-border px-6">
        <div className="flex items-center">
          <Link to="/" className="font-heading text-lg font-black uppercase tracking-wider text-accent">
            Ervitex
          </Link>
          <span className="ml-2 rounded-sm bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">Admin</span>
        </div>
        <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="space-y-1 p-4">
        {navItems
          .filter((item) => !item.superOnly || user?.email === SUPER_ADMIN_EMAIL)
          .map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
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
          <LogOut className="mr-2 h-3 w-3" /> Iziet
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar - desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-card lg:block">
        {sidebarContent}
      </aside>

      {/* Sidebar - mobile */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card transition-transform duration-200 lg:hidden ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-card px-4 lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="p-1 text-muted-foreground hover:text-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-heading text-sm font-bold uppercase tracking-wider text-accent">Ervitex Admin</span>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
