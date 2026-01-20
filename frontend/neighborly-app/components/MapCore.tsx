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

// Red marker icon for neighbors
const redIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapProps {
  lat: number;
  lng: number;
  neighbors?: any[];
}

export default function MapCore({ lat, lng, neighbors = [] }: MapProps) {
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
          icon={redIcon}
        >
          <Popup>
            <div className="text-center">
              <strong className="block text-sm">{neighbor.name}</strong>
              <span className="text-xs text-slate-500">{neighbor.role}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
