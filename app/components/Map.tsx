"use client";

import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression } from "leaflet";
import { useEffect, useState, useRef } from "react";

interface RouteData {
    characterName: string;
    path: [number, number][]; // Definimos explícitamente como tuplas de números
}

const characterIcon = new L.Icon({
    iconUrl: "https://img.freepik.com/vector-premium/trineo-santa-claus-flat-blue-simple-icon-sombra-larga_159242-10179.jpg",
    iconSize: [45, 45],
    iconAnchor: [45, 45],
});

// --- SUB-COMPONENTE PARA SEGUIMIENTO DE CÁMARA ---
function MapFollower({ position }: { position: LatLngExpression }) {
    const map = useMap();
    useEffect(() => {
        map.panTo(position, { animate: true, duration: 0.5 });
    }, [position, map]);
    return null;
}

// --- LÓGICA DE INTERPOLACIÓN ---
const interpolate = (start: number, end: number, t: number) => start + (end - start) * t;

export default function Map() {
    const [routeData, setRouteData] = useState<RouteData | null>(null);
    const [currentPos, setCurrentPos] = useState<[number, number]>([0, 0]);
    const [isPlaying, setIsPlaying] = useState(false);

    // Referencias para controlar la animación sin re-renders excesivos
    const requestRef = useRef<number>();
    const indexRef = useRef(0);
    const progressRef = useRef(0); // Va de 0 a 1 entre dos puntos

    useEffect(() => {
        fetch("/data.json")
            .then((res) => res.json())
            .then((data: RouteData) => {
                setRouteData(data);
                setCurrentPos(data.path[0]);
            });
    }, []);

    const animate = () => {
        if (!routeData) return;

        const path = routeData.path;
        // Incrementar progreso (ajusta 0.02 para cambiar la velocidad)
        progressRef.current += 0.015;

        if (progressRef.current >= 1) {
            progressRef.current = 0;
            indexRef.current += 1;
        }

        if (indexRef.current < path.length - 1) {
            const start = path[indexRef.current];
            const end = path[indexRef.current + 1];

            const lat = interpolate(start[0], end[0], progressRef.current);
            const lng = interpolate(start[1], end[1], progressRef.current);

            setCurrentPos([lat, lng]);
            requestRef.current = requestAnimationFrame(animate);
        } else {
            setIsPlaying(false);
        }
    };

    useEffect(() => {
        if (isPlaying) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying]);

    if (!routeData) return <p>Cargando mapa fluido...</p>;

    return (
        <div style={{ position: "relative", height: "100%", width: "100%" }}>
            <div style={{ position: "absolute", top: "10px", left: "10px", zIndex: 1000 }}>
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{ padding: "10px", cursor: "pointer", borderRadius: "5px", border: "none", backgroundColor: "#333", color: "#fff" }}
                >
                    {isPlaying ? "⏸ Detener" : "▶ Iniciar Recorrido"}
                </button>
            </div>

            <MapContainer center={routeData.path[0]} zoom={15} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Recorrido completo */}
                <Polyline positions={routeData.path} pathOptions={{ color: "orange", weight: 2, dashArray: "10, 10" }} />

                {/* Personaje con movimiento suave */}
                <Marker position={currentPos} icon={characterIcon} />

                {/* Componente que mueve la cámara automáticamente */}
                <MapFollower position={currentPos} />
            </MapContainer>
        </div>
    );
}