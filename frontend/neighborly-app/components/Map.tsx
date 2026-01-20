"use client";

import dynamic from "next/dynamic";

// 1. Dynamic import happens here, inside a Client Component
const MapCore = dynamic(() => import("./MapCore"), {
  ssr: false, // This is now allowed because we are in a "use client" file
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">
      Loading Map...
    </div>
  ),
});

interface MapProps {
  lat: number;
  lng: number;
}

// 2. We export a plain component that simply renders the dynamic one
export default function Map(props: MapProps) {
  return <MapCore {...props} />;
}
