"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- TIPOS ---
interface LocationItem {
    id: string;
    title: string;
    lat: number;
    lng: number;
}

// --- CONFIGURACIÓN DE ICONOS ---
const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// --- SUB-COMPONENTE PARA CAPTURAR CLICS ---
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (e) => {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function LocationManager() {
    const [locations, setLocations] = useState<LocationItem[]>([]);
    const [form, setForm] = useState<{ title: string; lat: number; lng: number }>({ title: "", lat: 0, lng: 0 });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    // Cargar de localStorage al montar
    useEffect(() => {
        setIsClient(true);
        const saved = localStorage.getItem("my_locations");
        if (saved) {
            try {
                setLocations(JSON.parse(saved));
            } catch (e) {
                console.error("Error parsing locations", e);
            }
        }
    }, []);

    // Guardar en localStorage cada vez que cambia 'locations'
    useEffect(() => {
        if (isClient) {
            localStorage.setItem("my_locations", JSON.stringify(locations));
        }
    }, [locations, isClient]);

    // Manejar clic en el mapa
    const handleMapClick = (lat: number, lng: number) => {
        setForm({ ...form, lat, lng });
    };

    // Guardar (Crear o Editar)
    const handleSave = () => {
        if (!form.title) {
            alert("Por favor ingresa un título.");
            return;
        }

        if (editingId) {
            // MODO EDICIÓN
            setLocations((prev) =>
                prev.map((loc) => (loc.id === editingId ? { ...loc, ...form } : loc))
            );
            setEditingId(null);
        } else {
            // MODO CREACIÓN
            const newLoc: LocationItem = {
                id: crypto.randomUUID(),
                ...form,
            };
            setLocations((prev) => [...prev, newLoc]);
        }

        // Reset form
        setForm({ title: "", lat: 0, lng: 0 });
    };

    // Preparar edición
    const handleEdit = (loc: LocationItem) => {
        setForm({ title: loc.title, lat: loc.lat, lng: loc.lng });
        setEditingId(loc.id);
    };

    // Eliminar
    const handleDelete = (id: string) => {
        if (confirm("¿Seguro que quieres eliminar esta ubicación?")) {
            setLocations((prev) => prev.filter((l) => l.id !== id));
            if (editingId === id) {
                setEditingId(null);
                setForm({ title: "", lat: 0, lng: 0 });
            }
        }
    };

    // Cancelar edición
    const handleCancel = () => {
        setEditingId(null);
        setForm({ title: "", lat: 0, lng: 0 });
    };

    if (!isClient) return <p className="p-4 text-gray-500">Cargando módulo de ubicaciones...</p>;

    return (
        <div className="flex h-screen font-sans">
            {/* BARRA LATERAL */}
            <div className="w-[350px] p-5 border-r border-gray-200 flex flex-col gap-5 overflow-y-auto bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-800 m-0">Gestor de Ubicaciones</h2>

                {/* FORMULARIO */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mt-0 mb-3">
                        {editingId ? "Editar Ubicación" : "Nueva Ubicación"}
                    </h3>

                    <div className="mb-3">
                        <label className="block text-xs font-medium mb-1 text-black">Título</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="Ej. Casa de Juan"
                            className="w-full p-2 text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />
                    </div>

                    <div className="flex gap-3 mb-3">
                        <div className="flex-1">
                            <label className="block text-xs font-medium mb-1 text-black">Latitud</label>
                            <input
                                type="number"
                                value={form.lat}
                                onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) })}
                                className="w-full p-2 text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium mb-1 text-black">Longitud</label>
                            <input
                                type="number"
                                value={form.lng}
                                onChange={(e) => setForm({ ...form, lng: parseFloat(e.target.value) })}
                                className="w-full p-2 text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            />
                        </div>
                    </div>

                    <p className="text-[11px] text-gray-600 mb-3">
                        💡 Haz clic en el mapa para capturar coordenadas automáticamente.
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded transition-colors"
                        >
                            {editingId ? "Actualizar" : "Guardar"}
                        </button>
                        {editingId && (
                            <button
                                onClick={handleCancel}
                                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded transition-colors"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>

                {/* LISTA DE UBICACIONES */}
                <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-700 mb-2">Guardados ({locations.length})</h3>
                    {locations.length === 0 && <p className="text-gray-500 text-sm">No hay ubicaciones guardadas.</p>}
                    <ul className="list-none p-0 m-0 space-y-2">
                        {locations.map((loc) => (
                            <li
                                key={loc.id}
                                className="bg-white p-3 rounded-md border border-gray-200 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow"
                            >
                                <div>
                                    <strong className="block text-sm text-gray-800">{loc.title}</strong>
                                    <span className="text-[11px] text-gray-600">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => handleEdit(loc)}
                                        className="w-7 h-7 flex items-center justify-center bg-amber-400 hover:bg-amber-500 text-white rounded transition-colors"
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(loc.id)}
                                        className="w-7 h-7 flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white rounded transition-colors"
                                        title="Eliminar"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* MAPA */}
            <div className="flex-1 relative z-0">
                <MapContainer center={[51.505, -0.09]} zoom={13} className="h-full w-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    <MapClickHandler onLocationSelect={handleMapClick} />

                    {/* Marcador Temporal */}
                    {(form.lat !== 0 || form.lng !== 0) && (
                        <Marker position={[form.lat, form.lng]} icon={defaultIcon} opacity={0.6}>
                            <Popup>Ubicación actual en formulario</Popup>
                        </Marker>
                    )}

                    {/* Marcadores Guardados */}
                    {locations.map((loc) => (
                        <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={defaultIcon}>
                            <Popup>
                                <strong>{loc.title}</strong>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
