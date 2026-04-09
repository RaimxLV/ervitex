import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const LAT = 56.9617;
const LNG = 24.1664;

const WAZE_URL = "https://waze.com/ul?q=Braslas%20iela%2029%20Riga&ll=56.9617,24.1664&navigate=yes";
const GMAPS_URL = "https://www.google.com/maps/dir/?api=1&destination=56.9617,24.1664";

const GoogleMapEmbed = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const { lang } = useLanguage();

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [LAT, LNG],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    // Light map tiles (CartoDB Voyager)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.control.attribution({ position: "bottomleft", prefix: false }).addTo(map);

    // Custom marker
    const icon = L.divIcon({
      className: "",
      html: `<div style="
        display:flex;align-items:center;justify-content:center;
        width:40px;height:40px;border-radius:50%;
        background:#F97316;border:3px solid #fff;
        box-shadow:0 4px 14px rgba(249,115,22,0.5);
      "><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -42],
    });

    const marker = L.marker([LAT, LNG], { icon }).addTo(map);
    marker.bindPopup(
      `<div style="font-family:system-ui;text-align:center;padding:4px 2px;">
        <strong style="font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Ervitex / T-Bode</strong><br/>
        <span style="font-size:11px;color:#666;">Ieeja D – 2. stāvs</span>
      </div>`,
      { closeButton: false, className: "leaflet-popup-custom" }
    );

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="space-y-4"
    >
      {/* Map */}
      <div className="relative overflow-hidden rounded-sm border border-border z-0">
        <div ref={mapRef} className="w-full" style={{ height: 400, zIndex: 0 }} />
        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-sm bg-primary/95 px-4 py-2.5 shadow-lg backdrop-blur-sm z-[1000]">
          <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
          <div>
            <p className="font-heading text-xs font-bold uppercase tracking-wider text-primary-foreground">ERVITEX</p>
            <p className="text-[10px] text-primary-foreground/60">Braslas Biznesa Centrs, Ieeja D, 2. stāvs</p>
          </div>
        </div>
      </div>

      {/* Info text */}
      <p className="text-sm text-muted-foreground text-center">
        {lang === "lv"
          ? "Pasūtījumus var saņemt personīgi T-Bode birojā Rīgā, Braslas ielā 29, D ieeja."
          : "Orders can be picked up in person at the T-Bode office in Riga, Braslas street 29, entrance D."}
      </p>

      {/* Navigation buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={WAZE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 rounded-sm border border-border bg-card px-4 py-3 text-sm font-heading font-bold uppercase tracking-wide text-foreground transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
        >
          <svg className="h-5 w-5 text-[#33CCFF]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.54 6.63c-1.62-4.14-6.96-5.26-10.3-3.8A7.65 7.65 0 006.3 6.08c-.7 1.68-.56 3.46-.38 5.22.08.74.26 1.63.95 2.04.37.22.8.24 1.21.2.88-.1 1.73-.42 2.58-.62a12.04 12.04 0 012.78-.3c.92-.01 1.98.14 2.6.84.53.59.63 1.43.48 2.18-.14.75-.5 1.44-.89 2.1-.38.64-.82 1.33-.72 2.08.08.62.49 1.16 1 1.48.5.33 1.12.46 1.72.42a4.14 4.14 0 002.97-1.65c1.58-1.96 1.97-4.68 1.73-7.19-.13-1.39-.43-2.76-.79-4.1v-.05zM9.5 10.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
          </svg>
          {lang === "lv" ? "Atvērt Waze" : "Open Waze"}
        </a>
        <a
          href={GMAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 rounded-sm border border-border bg-card px-4 py-3 text-sm font-heading font-bold uppercase tracking-wide text-foreground transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
        >
          <Navigation className="h-5 w-5 text-accent" strokeWidth={1.5} />
          {lang === "lv" ? "Atvērt Google Maps" : "Open Google Maps"}
        </a>
      </div>
    </motion.div>
  );
};

export default GoogleMapEmbed;
