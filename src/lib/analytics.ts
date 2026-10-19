// Google Analytics 4 (gtag.js) — inicializējas vienu reizi pārlūkā.
// Mērījuma ID nāk no Google Analytics savienojuma (VITE_LOVABLE_CONNECTOR_*).
const measurementId = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY as
  | string
  | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;
// The gtag("config") hit already counts the initial page view; remember the
// path so the router subscription never sends the same page twice.
let lastTrackedPath = "";

export function initAnalytics() {
  if (initialized || typeof window === "undefined" || !measurementId) return;
  initialized = true;
  lastTrackedPath = window.location.pathname + window.location.search;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  // gtag.js needs the real Arguments object; plain arrays are ignored and no hits are sent.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  } as (...args: unknown[]) => void;
  window.gtag("set", "developer_id.dZjgwMW", true);
  window.gtag("js", new Date());
  window.gtag("config", measurementId);
}

export function trackPageView(path: string) {
  if (!measurementId || typeof window === "undefined" || !window.gtag) return;
  if (path === lastTrackedPath) return;
  lastTrackedPath = path;
  window.gtag("event", "page_view", { page_path: path });
}
