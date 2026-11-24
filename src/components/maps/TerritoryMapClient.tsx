"use client";
import { useEffect, useRef } from "react";
import type { IControl, Map as MapLibreMap, Popup as MapLibrePopup } from "maplibre-gl";
import type { Feature, FeatureCollection, Polygon } from "geojson";

// State center lat/lng lookup
const STATE_CENTERS: Record<string, [number, number]> = {
  AL:[32.8,-86.8],AK:[64.2,-153.4],AZ:[34.3,-111.1],AR:[34.8,-92.2],CA:[36.8,-119.4],
  CO:[39.0,-105.5],CT:[41.6,-72.7],DE:[39.0,-75.5],FL:[28.7,-82.4],GA:[32.7,-83.2],
  HI:[20.9,-157.0],ID:[44.4,-114.5],IL:[40.0,-89.2],IN:[39.9,-86.3],IA:[42.0,-93.5],
  KS:[38.5,-98.4],KY:[37.5,-85.3],LA:[31.1,-91.9],ME:[45.4,-69.2],MD:[39.0,-76.8],
  MA:[42.3,-71.8],MI:[44.3,-85.4],MN:[46.4,-93.1],MS:[32.7,-89.7],MO:[38.5,-92.5],
  MT:[47.0,-110.4],NE:[41.5,-99.9],NV:[39.3,-116.6],NH:[43.7,-71.6],NJ:[40.1,-74.5],
  NM:[34.8,-106.2],NY:[42.2,-74.9],NC:[35.5,-79.4],ND:[47.5,-100.5],OH:[40.4,-82.8],
  OK:[35.6,-97.5],OR:[44.1,-120.5],PA:[40.9,-77.8],RI:[41.7,-71.5],SC:[33.9,-81.0],
  SD:[44.4,-100.2],TN:[35.9,-86.7],TX:[31.5,-99.3],UT:[39.3,-111.1],VT:[44.0,-72.7],
  VA:[37.8,-78.2],WA:[47.4,-120.4],WV:[38.9,-80.5],WI:[44.3,-89.8],WY:[43.0,-107.6],
  DC:[38.9,-77.0],
};

type HospStatus = "PROSPECT" | "ACTIVE" | "INACTIVE" | string;
interface MapHospital {
  id: string; hospitalName: string; city?: string | null; state?: string | null;
  status: HospStatus; assignedRepName?: string | null;
}
interface MapRep {
  id: string; name: string; color: string; states: string[];
}
interface OverdueMapHospital {
  id: string; hospitalName: string; city?: string | null; state?: string | null;
  status: string; daysSinceActivity: number | null;
  contacts: Array<{ name: string; title?: string | null }>;
}

interface Props {
  hospitals: MapHospital[];
  repTerritories: MapRep[];
  overdueHospitals?: OverdueMapHospital[];
}

const STATUS_CLR: Record<string, string> = {
  ACTIVE: "var(--nyx-accent)", PROSPECT: "#fbbf24", INACTIVE: "#64748b",
};

// CARTO Dark Matter vector style. CARTO raster basemaps now require an API
// key and serve "API KEY REQUIRED" placeholder tiles; the GL style and its
// vector tiles are keyless.
const DARK_MATTER_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

// MapLibre v6 derives its web worker URL as a sibling file of the library
// module (maplibre-gl-worker.mjs next to import.meta.url). In a Next.js
// bundle that sibling file does not exist, the worker 404s, vector tiles
// never parse, the map "load" event never fires, and the canvas stays on
// the style background with no geography and no markers. Point the worker
// at the pinned CDN file instead (same host and version as the CSS below).
const MAPLIBRE_WORKER_URL = "https://unpkg.com/maplibre-gl@6.19.0/dist/maplibre-gl-worker.mjs";

// Slightly jitter markers within the same state so they don't stack
function jitter(seed: number, range: number) {
  // deterministic-ish jitter using index
  const a = Math.sin(seed * 9301 + 49297) * 233280;
  return ((a - Math.floor(a)) - 0.5) * range * 2;
}

// Geodesic circle polygon ([lng, lat] ring) matching an L.circle of the
// same radius in meters, for use as a GeoJSON fill/line layer
function circlePolygon(centerLatLng: [number, number], radiusMeters: number, steps = 64): [number, number][] {
  const [lat, lng] = centerLatLng;
  const earthRadius = 6371008.8;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const angularDistance = radiusMeters / earthRadius;
  const ring: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const bearing = ((i * 360) / steps) * (Math.PI / 180);
    const pointLat = Math.asin(
      Math.sin(latRad) * Math.cos(angularDistance) +
      Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearing)
    );
    const pointLng = lngRad + Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latRad),
      Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(pointLat)
    );
    ring.push([(pointLng * 180) / Math.PI, (pointLat * 180) / Math.PI]);
  }
  return ring;
}

// Legend control - same content and styling as the previous Leaflet control
class LegendControl implements IControl {
  private container: HTMLDivElement | null = null;

  onAdd(): HTMLElement {
    const div = document.createElement("div");
    div.style.cssText = "background:rgba(10,18,35,0.9);padding:12px 16px;border-radius:8px;border:1px solid var(--nyx-accent-mid);font-size:0.75rem;color:#d8e8f4;min-width:150px";
    div.innerHTML = `
      <div style="font-weight:700;font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--nyx-accent-label);margin-bottom:8px">Account Status</div>
      ${[["ACTIVE","var(--nyx-accent)"],["PROSPECT","#fbbf24"],["INACTIVE","#64748b"]].map(([s,c]) =>
        `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c}"></span>${s}
        </div>`
      ).join("")}
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08)">
        <div style="display:flex;align-items:center;gap:6px">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#fb923c"></span>Overdue 30d+
        </div>
      </div>
    `;
    this.container = div;
    return div;
  }

  onRemove(): void {
    this.container?.parentNode?.removeChild(this.container);
    this.container = null;
  }
}

type TerritoryProps = { repName: string; state: string; color: string };

export default function TerritoryMapClient({ hospitals, repTerritories, overdueHospitals = [] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let removed = false;

    // Dynamically import maplibre-gl to avoid SSR issues
    import("maplibre-gl").then(maplibregl => {
      if (removed || !containerRef.current) return;

      maplibregl.setWorkerUrl(MAPLIBRE_WORKER_URL);

      // Inject pulse animation for overdue markers
      if (!document.getElementById("nyx-overdue-style")) {
        const style = document.createElement("style");
        style.id = "nyx-overdue-style";
        style.textContent = `
          @keyframes nyx-overdue-pulse {
            0% { box-shadow: 0 0 0 0 rgba(251,146,60,0.7), 0 0 8px rgba(251,146,60,0.5); }
            70% { box-shadow: 0 0 0 8px rgba(251,146,60,0), 0 0 8px rgba(251,146,60,0.3); }
            100% { box-shadow: 0 0 0 0 rgba(251,146,60,0), 0 0 8px rgba(251,146,60,0.5); }
          }
          .nyx-overdue-marker { animation: nyx-overdue-pulse 2s ease-out infinite; }
        `;
        document.head.appendChild(style);
      }

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: DARK_MATTER_STYLE,
        center: [-111.5, 34.3],
        zoom: 6,
        minZoom: 3,
        maxZoom: 12,
      });
      mapRef.current = map;

      // Zoom control in the top-left, where the Leaflet control sat
      map.addControl(new maplibregl.NavigationControl(), "top-left");
      map.addControl(new LegendControl(), "bottom-right");

      map.on("load", () => {
        if (removed) return;

        // Draw state territory fills per rep - GeoJSON circle polygons
        // (180 km radius, same as the previous L.circle rendering)
        const features: Feature<Polygon, TerritoryProps>[] = [];
        repTerritories.forEach(rep => {
          rep.states.forEach(state => {
            const center = STATE_CENTERS[state];
            if (!center) return;
            features.push({
              type: "Feature",
              properties: { repName: rep.name, state, color: rep.color },
              geometry: { type: "Polygon", coordinates: [circlePolygon(center, 180000)] },
            });
          });
        });
        const collection: FeatureCollection<Polygon, TerritoryProps> = { type: "FeatureCollection", features };
        map.addSource("nyx-territories", { type: "geojson", data: collection });
        map.addLayer({
          id: "nyx-territory-fill",
          type: "fill",
          source: "nyx-territories",
          paint: { "fill-color": ["get", "color"], "fill-opacity": 0.08 },
        });
        map.addLayer({
          id: "nyx-territory-line",
          type: "line",
          source: "nyx-territories",
          paint: { "line-color": ["get", "color"], "line-width": 1, "line-dasharray": [4, 4] },
        });

        // Sticky tooltip following the mouse over a territory circle,
        // replacing the Leaflet bindTooltip(..., { sticky: true })
        const tooltip = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
        map.on("mousemove", "nyx-territory-fill", e => {
          const feature = e.features?.[0];
          if (!feature) return;
          tooltip
            .setLngLat(e.lngLat)
            .setHTML(`<b>${String(feature.properties?.repName ?? "")}</b><br>${String(feature.properties?.state ?? "")}`)
            .addTo(map);
        });
        map.on("mouseleave", "nyx-territory-fill", () => tooltip.remove());

        // Leaflet keeps a single popup open at a time; mirror that here
        const openPopups: MapLibrePopup[] = [];
        const trackPopup = (popup: MapLibrePopup) => {
          openPopups.push(popup);
          popup.on("open", () => {
            openPopups.forEach(p => {
              if (p !== popup && p.isOpen()) p.remove();
            });
          });
        };

        // Hospital markers
        hospitals.forEach((h, idx) => {
          const state = h.state ?? "";
          const center = STATE_CENTERS[state];
          if (!center) return;

          const lat = center[0] + jitter(idx * 3, 0.6);
          const lng = center[1] + jitter(idx * 3 + 1, 0.8);
          const color = STATUS_CLR[h.status] ?? "#64748b";

          const el = document.createElement("div");
          el.style.cssText = `
            width:14px;height:14px;border-radius:50%;
            background:${color};
            border:2px solid rgba(255,255,255,0.9);
            box-shadow:0 0 8px ${color}cc,0 0 2px rgba(0,0,0,0.8);
            cursor:pointer;
          `;

          const popup = new maplibregl.Popup({ maxWidth: "250px" }).setHTML(`
            <div style="min-width:180px;line-height:1.6">
              <div style="font-weight:800;font-size:0.95rem;margin-bottom:4px">${h.hospitalName}</div>
              <div style="font-size:0.78rem;color:#666">${h.city ?? ""}${h.city && h.state ? ", " : ""}${h.state ?? ""}</div>
              <div style="margin-top:6px;display:flex;align-items:center;gap:6px">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color}"></span>
                <span style="font-size:0.78rem;font-weight:700;text-transform:uppercase">${h.status}</span>
              </div>
              ${h.assignedRepName ? `<div style="font-size:0.75rem;color:#888;margin-top:2px">Rep: ${h.assignedRepName}</div>` : ""}
            </div>
          `);
          trackPopup(popup);

          new maplibregl.Marker({ element: el })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map);
        });

        // Overdue hospital markers (pulsing amber)
        overdueHospitals.forEach((h, idx) => {
          const state = h.state ?? "";
          const center = STATE_CENTERS[state];
          if (!center) return;

          const lat = center[0] + jitter(idx * 7 + 2, 0.55);
          const lng = center[1] + jitter(idx * 7 + 3, 0.75);

          const el = document.createElement("div");
          el.className = "nyx-overdue-marker";
          el.style.cssText = `
            width:15px;height:15px;border-radius:50%;
            background:#fb923c;
            border:2px solid rgba(255,255,255,0.9);
            cursor:pointer;
          `;

          const contactHtml = h.contacts.length
            ? h.contacts.slice(0, 3).map(c => `<div style="font-size:0.75rem;color:#fb923c;margin-top:2px">${c.name}${c.title ? ` <span style="color:#888;font-weight:400">(${c.title})</span>` : ""}</div>`).join("")
            : `<div style="font-size:0.75rem;color:#888;margin-top:2px">No contacts on file</div>`;

          const popup = new maplibregl.Popup({ maxWidth: "260px" }).setHTML(`
            <div style="min-width:190px;line-height:1.6">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#fb923c;flex-shrink:0"></span>
                <span style="font-weight:800;font-size:0.9rem">${h.hospitalName}</span>
              </div>
              <div style="font-size:0.78rem;color:#666">${h.city ?? ""}${h.city && h.state ? ", " : ""}${h.state ?? ""}</div>
              <div style="margin-top:6px;font-size:0.78rem;font-weight:700;color:#fb923c">
                ${h.daysSinceActivity != null ? `No contact in ${h.daysSinceActivity} days` : "Never contacted"}
              </div>
              <div style="margin-top:6px;font-size:0.7rem;font-weight:700;text-transform:uppercase;color:#888">Status: ${h.status}</div>
              <div style="margin-top:8px;border-top:1px solid #333;padding-top:8px">
                <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#888;margin-bottom:4px">Contacts</div>
                ${contactHtml}
              </div>
            </div>
          `);
          trackPopup(popup);

          new maplibregl.Marker({ element: el })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map);
        });
      });
    });

    return () => {
      removed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [hospitals, repTerritories]);

  return (
    <>
      {/* MapLibre GL CSS */}
      <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@6.19.0/dist/maplibre-gl.css" />
      <div ref={containerRef} style={{ width: "100%", height: 500, borderRadius: 10, overflow: "hidden" }} />
    </>
  );
}
