import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const LAT = 56.9617;
const LNG = 24.1664;

export const WAZE_URL = "https://waze.com/ul?q=Braslas%20iela%2029%20Riga&ll=56.9617,24.1664&navigate=yes";
export const GMAPS_URL = "https://www.google.com/maps/dir/?api=1&destination=56.9617,24.1664";

/** Plain Leaflet map. No transform animations around it — they break tile positioning. */
const GoogleMapEmbed = ({ className = "h-[320px] sm:h-[420px]" }: { className?: string }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;

    const map = L.map(el, {
      center: [LAT, LNG],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.control.attribution({ position: "bottomleft", prefix: false })
      .addAttribution("© OpenStreetMap")
      .addTo(map);

    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "0 85% 50%";
    const icon = L.divIcon({
      className: "",
      html: `<div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:hsl(${accent});border:3px solid #fff;box-shadow:0 4px 14px hsl(${accent} / .45);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
    L.marker([LAT, LNG], { icon }).addTo(map);

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    const t = window.setTimeout(() => map.invalidateSize(), 300);

    return () => {
      window.clearTimeout(t);
      ro.disconnect();
      map.remove();
    };
  }, []);

  return <div ref={mapRef} className={`relative z-0 w-full ${className}`} />;
};

export default GoogleMapEmbed;
