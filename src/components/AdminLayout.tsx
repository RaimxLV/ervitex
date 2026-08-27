import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  MessageSquare, LogOut, LayoutDashboard, Users, ArrowLeft,
  LayoutGrid, BadgeEuro, FileText, MoreHorizontal,
} from "lucide-react";

const SUPER_ADMIN_EMAIL = "ofsetadruka@gmail.com";

type NavItem = { to: string; icon: typeof FileText; label: string; short?: string; superOnly?: boolean };

/** Primary items — always visible (desktop strip + mobile bottom bar). */
const primary: NavItem[] = [
  { to: "/admin", icon: LayoutDashboard, label: "Panelis", short: "Panelis" },
  { to: "/admin/offers", icon: FileText, label: "Piedāvājumi", short: "Piedāv." },
  { to: "/admin/quotes", icon: MessageSquare, label: "Pieprasījumi", short: "Pieprs." },
  { to: "/admin/price-audit", icon: BadgeEuro, label: "Cenu audits", short: "Cenas" },
];

/** Secondary items — desktop strip + mobile "Vairāk" sheet. */
const secondary: NavItem[] = [
  { to: "/admin/mega-menu", icon: LayoutGrid, label: "Mega izvēlne" },
  { to: "/admin/users", icon: Users, label: "Lietotāji", superOnly: true },
];


const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isSuper = user?.email === SUPER_ADMIN_EMAIL;
  const visibleSecondary = secondary.filter((i) => !i.superOnly || isSuper);
  const isActive = (to: string) => location.pathname === to;
  const secondaryActive = visibleSecondary.some((i) => isActive(i.to));

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} aria-label="Uz veikalu">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Link to="/admin" className="font-heading text-base font-black uppercase tracking-wider text-accent">
              Ervitex
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-[180px] truncate text-xs text-muted-foreground sm:block">{user?.email}</span>
            <Button variant="outline" size="sm" className="text-xs" onClick={handleSignOut}>
              <LogOut className="h-3.5 w-3.5 sm:mr-2" />
              <span className="hidden sm:inline">Iziet</span>
            </Button>
          </div>
        </div>

        {/* Desktop nav strip */}
        <nav className="mx-auto hidden max-w-7xl flex-wrap gap-1 px-4 pb-2 sm:flex">
          {[...primary, ...visibleSecondary].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm transition-colors ${
                isActive(item.to)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl p-3 sm:p-6">{children}</main>

      {/* Mobile bottom nav */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card sm:hidden"
        style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
      >
        <div className="grid grid-cols-5 items-stretch px-1 pt-1.5">
          {primary.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-1 py-1 text-[10px] ${
                isActive(item.to) ? "text-accent" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.short ?? item.label}
            </Link>
          ))}
          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label="Vairāk sadaļu"
                className={`flex flex-col items-center gap-0.5 rounded-lg px-1 py-1 text-[10px] ${
                  secondaryActive ? "text-accent" : "text-muted-foreground"
                }`}
              >
                <MoreHorizontal className="h-5 w-5" />
                Vairāk
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-left font-heading uppercase tracking-wider">Vairāk sadaļu</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-2">
                {visibleSecondary.map((item) => (
                  <SheetClose asChild key={item.to}>
                    <Link
                      to={item.to}
                      className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-xs transition-colors ${
                        isActive(item.to)
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
