"use client";
import dynamic from "next/dynamic";

// Importamos dinámicamente para desactivar SSR
const MapWithNoSSR = dynamic(() => import("./components/Map"), {
  ssr: false,
  loading: () => <p>Cargando mapa en pantalla...</p>
});

export default function Home() {
  return (
    <main style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Seguimiento de Personaje (TS)</h1>
      <div style={{ height: "500px", width: "100%", borderRadius: "8px", overflow: "hidden" }}>
        <MapWithNoSSR />
      </div>
    </main>
  );
}