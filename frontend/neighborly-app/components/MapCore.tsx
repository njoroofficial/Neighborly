"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Manually define the icon URL to avoid webpack issues
const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png";
const iconRetinaUrl =
  "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const shadowUrl =
  "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

const customIcon = L.icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
// A Red Icon for Help Requests
const requestIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// A Yellow Icon for "In Progress"
const inProgressIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png", // Using orange as yellow is hard to see
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapProps {
  lat: number;
  lng: number;
  neighbors?: any[];
  requests?: any[];
  onNeighborClick?: (neighbor: any) => void;
  onRequestAccept?: (id: number) => void;
}

export default function MapCore({
  lat,
  lng,
  neighbors = [],
  requests = [],
  onNeighborClick,
  onRequestAccept,
}: MapProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      scrollWheelZoom={false}
      className="h-full w-full rounded-lg z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 1. YOU (Blue Marker) */}
      <Marker position={[lat, lng]} icon={customIcon}>
        <Popup>You are here! 🏡</Popup>
      </Marker>

      {/* 2. NEIGHBORS (Loop through them) */}
      {neighbors.map((neighbor: any) => (
        <Marker
          key={neighbor.id}
          position={[neighbor.latitude, neighbor.longitude]}
          icon={customIcon}
          eventHandlers={{
            click: () => {
              // When clicked, tell the Dashboard Shell!
              if (onNeighborClick) onNeighborClick(neighbor);
            },
          }}
        ></Marker>
      ))}

      {/* 3. REQUEST MARKERS (Red Pins) */}
      {requests.map((req: any) => (
        <Marker
          key={`req-${req.id}`}
          position={[req.latitude, req.longitude]}
          icon={req.status === "in_progress" ? inProgressIcon : requestIcon}
        >
          <Popup>
            <div className="text-center min-w-37.5">
              <strong className="block text-sm text-red-600 mb-1">
                📢 {req.title}
              </strong>
              <p className="text-xs text-slate-600 mb-2">{req.description}</p>

              {/* Only show button if status is open */}
              {req.status === "open" && (
                <button
                  className="bg-slate-900 text-white text-xs px-2 py-1 rounded w-full hover:bg-slate-700 transition-colors"
                  onClick={() => {
                    if (onRequestAccept) onRequestAccept(req.id);
                  }}
                >
                  Offer Help ✋
                </button>
              )}

              {/* If it's already taken, show status */}
              {req.status === "in_progress" && (
                <div className="text-xs text-amber-600 font-bold border border-amber-200 bg-amber-50 rounded px-1">
                  ⚠ In Progress
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
