import { Suspense, useEffect, type ReactNode } from "react";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  type ErrorComponentProps,
  useRouter,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import { QuoteCartProvider } from "@/hooks/useQuoteCart";
import QuoteCartButton from "@/components/quote/QuoteCartButton";
import WorksheetPickBar from "@/components/worksheet/WorksheetPickBar";
import ScrollToTop from "@/components/ScrollToTop";
import SmoothScroll from "@/components/SmoothScroll";
import RouteSeo from "@/components/RouteSeo";
import NotFound from "@/pages/NotFound";
import { HEAD_BOOTSTRAP_SCRIPT } from "@/lib/head-bootstrap";
import { reportLovableError } from "@/lib/lovable-error-reporting";

const TITLE = "Ervitex — apģērbu vairumtirdzniecība un apdruka Rīgā";
const DESCRIPTION =
  "SIA Ervitex — reklāmas apģērbu un tekstila vairumtirdzniecība ar sietspiedi, DTF, izšūšanu, sublimāciju un termodruku. 28+ gadu pieredze, birojs Rīgā.";
const SHARE_IMAGE =
  "https://ifwshbcwsehekbadsooh.supabase.co/storage/v1/object/public/product-images/ervitex-share.jpg";

const LOCAL_BUSINESS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "SIA Ervitex",
  url: "https://www.ervitex.lv",
  email: "birojs@ervitex.lv",
  telephone: "+371 67543384",
  vatID: "LV40002074377",
  foundingDate: "1998",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Braslas iela 29, D ieeja, 2. stāvs",
    addressLocality: "Rīga",
    postalCode: "LV-1084",
    addressCountry: "LV",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "09:00",
      closes: "17:30",
    },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: "09:00", closes: "16:00" },
  ],
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "author", content: "SIA Ervitex" },
      { name: "theme-color", content: "#0d0d0d" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: SHARE_IMAGE },
      { property: "og:locale", content: "lv_LV" },
      { property: "og:site_name", content: "Ervitex" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: SHARE_IMAGE },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", href: "/favicon.svg?v=ervitex-20261013", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon-96.png?v=ervitex-20261013", type: "image/png", sizes: "96x96" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=ervitex-20261013", sizes: "180x180" },
      { rel: "preload", as: "image", href: "/hero-poster.jpg", fetchPriority: "high" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap",
      },
      { rel: "preconnect", href: "https://wsrv.nl", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://res.cloudinary.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://images.nwgmedia.com" },
      { rel: "dns-prefetch", href: "https://images.pfconcept.com" },
    ],
    scripts: [
      { children: HEAD_BOOTSTRAP_SCRIPT },
      { type: "application/ld+json", children: JSON.stringify(LOCAL_BUSINESS_JSON_LD) },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: RootError,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="lv" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const RouteFallback = () => <div className="min-h-[60svh]" />;

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <QuoteCartProvider>
              <Toaster />
              <Sonner />
              <SmoothScroll />
              <ScrollToTop />
              <RouteSeo />
              <Suspense fallback={<RouteFallback />}>
                <Outlet />
              </Suspense>
              <QuoteCartButton />
              <WorksheetPickBar />
            </QuoteCartProvider>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function RootError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-md text-center">
        <h1 className="font-heading text-2xl font-bold">This page didn't load</h1>
        <p className="mt-3 text-muted-foreground">Lapu neizdevās ielādēt. Mēģiniet vēlreiz vai atgriezieties sākumā.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            className="bg-primary px-4 py-2 text-primary-foreground"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Mēģināt vēlreiz
          </button>
          <Link to="/" className="border border-border px-4 py-2">
            Uz sākumu
          </Link>
        </div>
      </div>
    </div>
  );
}
