"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Interfaz para la nueva ruta
interface UserRoute {
    title: string;
    path: [number, number][];
}

// Icono para los puntos que el usuario va creando
const dotIcon = L.divIcon({
    className: "dot-icon",
    html: `<div style="background-color: #ff4757; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
});

export default function RouteCreator() {
    const [title, setTitle] = useState("");
    const [tempPath, setTempPath] = useState<[number, number][]>([]);
    const [savedRoutes, setSavedRoutes] = useState<UserRoute[]>([]);

    // --- SUB-COMPONENTE PARA CAPTURAR CLICS ---
    function MapClickHandler() {
        useMapEvents({
            click: (e) => {
                const { lat, lng } = e.latlng;
                setTempPath((prev) => [...prev, [lat, lng]]);
            },
        });
        return null;
    }

    const handleSave = () => {
        if (!title || tempPath.length < 2) {
            alert("Por favor, añade un título y al menos dos puntos en el mapa.");
            return;
        }
        const newRoute: UserRoute = { title, path: tempPath };
        setSavedRoutes([...savedRoutes, newRoute]);

        // Limpiar formulario
        setTitle("");
        setTempPath([]);
        alert("¡Trayectoria guardada con éxito!");
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", height: "100vh", padding: "20px", fontFamily: "sans-serif" }}>

            {/* PANEL DE CONTROL */}
            <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <h3>Crear Nueva Trayectoria</h3>
                <input
                    type="text"
                    placeholder="Título de la ruta (ej. Paseo por el parque)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                />
                <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={handleSave} style={btnStyle("#0070f3")}>Guardar Ruta</button>
                    <button onClick={() => setTempPath([])} style={btnStyle("#ff4757")}>Limpiar Puntos</button>
                </div>
                <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
                    💡 Haz clic en el mapa para ir agregando puntos a tu recorrido.
                </p>
            </div>

            {/* MAPA */}
            <div style={{ flex: 1, borderRadius: "12px", overflow: "hidden", border: "1px solid #eee" }}>
                <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

                    {/* Capturador de clics */}
                    <MapClickHandler />

                    {/* Dibujamos la ruta que el usuario está creando actualmente */}
                    <Polyline positions={tempPath} pathOptions={{ color: "#ff4757", weight: 4 }} />

                    {/* Marcadores para cada clic del usuario */}
                    {tempPath.map((pos, idx) => (
                        <Marker key={idx} position={pos} icon={dotIcon} />
                    ))}

                    {/* Dibujamos las rutas YA guardadas */}
                    {savedRoutes.map((route, idx) => (
                        <Polyline key={idx} positions={route.path} pathOptions={{ color: "#0070f3", weight: 2, opacity: 0.5 }} />
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}

const btnStyle = (color: string) => ({
    backgroundColor: color,
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold" as const
});