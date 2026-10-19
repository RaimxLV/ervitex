// Google Analytics 4 (gtag.js) — inicializējas vienu reizi pārlūkā.
// Mērījuma ID nāk no Google Analytics savienojuma (VITE_LOVABLE_CONNECTOR_*).
//
// Noteikumi:
// - Skaitām tikai produkcijas hostus (www.ervitex.lv / ervitex.lv), lai
//   preview/localhost piesārņotu GA datus.
// - gtag config ar send_page_view:false — page_view sūtām tikai paši
//   (sākuma ielāde + katra SPA navigācija), viens skaidrs īpašnieks.
// - Privātās/token lapas (login, request, admin, offers, piedavajums,
//   saraksts, nodot) netiek skaitītas vispār.
// - Sūtām tikai pathname — nekad query string (tokens, meklēšanas vaicājumi).
//
// Piezīme: GA4 "enhanced measurement" page-view iestatījumu nevar pārbaudīt
// bez GA4 konta piekļuves; ja tas ir ieslēgts īpašumā, history-change
// pageviews var dubultoties — jāatslēdz GA4 administrēšanā.
const measurementId = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY as
  | string
  | undefined;

const ANALYTICS_HOSTS = new Set(["www.ervitex.lv", "ervitex.lv"]);
const PRIVATE_PATH = /^\/(login|request|admin|offers|piedavajums|saraksts|nodot)(\/|$)/;

/** GA skaita tikai produkcijas domēnus. */
export function isAnalyticsHost(hostname: string): boolean {
  return ANALYTICS_HOSTS.has(hostname);
}

/** Privātās/token lapas nekad netiek sūtītas uz GA. */
export function isPrivatePath(path: string): boolean {
  return PRIVATE_PATH.test(path);
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;
let lastTrackedPath = "";

export function initAnalytics() {
  if (initialized || typeof window === "undefined" || !measurementId) return;
  if (!isAnalyticsHost(window.location.hostname)) return;
  initialized = true;

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
  // send_page_view:false — mēs paši sūtām sākuma un navigācijas page_view.
  window.gtag("config", measurementId, { send_page_view: false });
  trackPageView(window.location.pathname);
}

export function trackPageView(path: string) {
  if (!measurementId || typeof window === "undefined" || !window.gtag) return;
  // Tikai pathname — query string (tokens, meklēšana) nekad netiek sūtīts.
  const cleanPath = path.split("?")[0].split("#")[0] || "/";
  if (cleanPath === lastTrackedPath) return;
  lastTrackedPath = cleanPath;
  if (isPrivatePath(cleanPath)) return;
  window.gtag("event", "page_view", {
    page_path: cleanPath,
    page_location: `${window.location.origin}${cleanPath}`,
    page_title: document.title,
  });
}
