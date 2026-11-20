import { useEffect, useMemo, useRef } from "react";
import L, { type LatLngBoundsExpression } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import mapPinIcon from "../../assets/utility/Map.svg";
import { CafeteriaCategoryBadge } from "./CafeteriaTags";
import type { Cafeteria } from "./mockCafeterias";
import "../../styles/life/Cafeteria.css";

const CAMPUS_BOUNDS: LatLngBoundsExpression = [
  [36.083, 140.095],
  [36.1165, 140.1125],
];

const MIN_ZOOM = 14;
const MAX_ZOOM = 18;
const FOCUS_ZOOM = 17;
const PIN_SIZE: [number, number] = [28, 42];
const SELECTED_PIN_SIZE: [number, number] = [38, 56];

type LocatedCafeteria = Cafeteria & { lat: number; lng: number };

type CafeteriaLocation = {
  key: string;
  lat: number;
  lng: number;
  cafeterias: LocatedCafeteria[];
};

const hasLocation = (cafeteria: Cafeteria): cafeteria is LocatedCafeteria =>
  cafeteria.lat !== undefined && cafeteria.lng !== undefined;

function groupByLocation(cafeterias: Cafeteria[]): CafeteriaLocation[] {
  const groups = new Map<string, CafeteriaLocation>();
  cafeterias.filter(hasLocation).forEach((cafeteria) => {
    const key = `${cafeteria.lat},${cafeteria.lng}`;
    const group = groups.get(key);
    if (group) group.cafeterias.push(cafeteria);
    else groups.set(key, { key, lat: cafeteria.lat, lng: cafeteria.lng, cafeterias: [cafeteria] });
  });
  return [...groups.values()];
}

function createPinIcon(count: number, selected: boolean) {
  const [width, height] = selected ? SELECTED_PIN_SIZE : PIN_SIZE;
  const badge = count > 1 ? `<span class="cafeteriaMapPinCount">${count}</span>` : "";
  return L.divIcon({
    className: `cafeteriaMapPin${selected ? " isSelected" : ""}`,
    html: `<img src="${mapPinIcon}" alt="" width="${width}" height="${height}" />${badge}`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height],
  });
}

function MapResizeSync() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function MapSelectionSync({ selected }: { selected: Cafeteria | null }) {
  const map = useMap();
  const previousIdRef = useRef(selected?.id ?? null);
  useEffect(() => {
    const id = selected?.id ?? null;
    if (previousIdRef.current === id) return;
    previousIdRef.current = id;
    if (!selected || !hasLocation(selected)) return;
    map.flyTo([selected.lat, selected.lng], Math.min(FOCUS_ZOOM, map.getMaxZoom()));
  }, [map, selected]);
  return null;
}

type LocationPopupProps = {
  location: CafeteriaLocation;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function LocationPopupList({ location, selectedId, onSelect }: LocationPopupProps) {
  const map = useMap();
  return (
    <ul className="cafeteriaMapPopupList" aria-label={`この場所の施設（${location.cafeterias.length}件）`}>
      {location.cafeterias.map((cafeteria) => (
        <li key={cafeteria.id}>
          <button
            type="button"
            className={`cafeteriaMapPopupItem${cafeteria.id === selectedId ? " isSelected" : ""}`}
            aria-pressed={cafeteria.id === selectedId}
            onClick={() => {
              onSelect(cafeteria.id);
              map.closePopup();
            }}
          >
            <span>{cafeteria.name}</span>
            <CafeteriaCategoryBadge category={cafeteria.category} />
          </button>
        </li>
      ))}
    </ul>
  );
}

type CafeteriaMapProps = {
  cafeterias: Cafeteria[];
  selected: Cafeteria | null;
  onSelect: (id: string) => void;
};

function CafeteriaMap({ cafeterias, selected, onSelect }: CafeteriaMapProps) {
  const locations = useMemo(() => groupByLocation(cafeterias), [cafeterias]);
  const selectedId = selected?.id ?? null;

  return (
    <div className="cafeteriaMap">
      <MapContainer
        className="cafeteriaMapCanvas"
        bounds={CAMPUS_BOUNDS}
        maxBounds={CAMPUS_BOUNDS}
        maxBoundsViscosity={1.0}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        />
        {locations.map((location) => {
          const isSelected = location.cafeterias.some((cafeteria) => cafeteria.id === selectedId);
          const isGroup = location.cafeterias.length > 1;
          const title = location.cafeterias.map((cafeteria) => cafeteria.name).join("、");
          return (
            <Marker
              key={location.key}
              position={[location.lat, location.lng]}
              icon={createPinIcon(location.cafeterias.length, isSelected)}
              title={title}
              alt={title}
              zIndexOffset={isSelected ? 1000 : 0}
              eventHandlers={
                isGroup ? undefined : { click: () => onSelect(location.cafeterias[0].id) }
              }
            >
              {isGroup && (
                <Popup className="cafeteriaMapPopup">
                  <LocationPopupList location={location} selectedId={selectedId} onSelect={onSelect} />
                </Popup>
              )}
            </Marker>
          );
        })}
        <MapSelectionSync selected={selected} />
        <MapResizeSync />
      </MapContainer>
    </div>
  );
}

export default CafeteriaMap;
