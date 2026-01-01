"use client";
import dynamic from "next/dynamic";


const LocationManager = dynamic(() => import("../components/LocationManager"), {
    ssr: false,
    loading: () => <p>Cargando mapa...</p>,
});

export default function LocationsPage() {
    return <LocationManager />;
}
