"use client";
// app/components/AvailabilityBadge.tsx
// Muestra disponibilidad en la página de reserva

import { useEffect, useState } from "react";

interface Props {
  hotelId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  onAvailabilityChange?: (available: boolean, roomsAvailable: number) => void;
}

export default function AvailabilityBadge({ hotelId, checkIn, checkOut, rooms, onAvailabilityChange }: Props) {
  const [status, setStatus] = useState<{
    available: boolean;
    roomsAvailable: number;
    lowAvailability: boolean;
    loading: boolean;
    error: string;
  }>({ available: true, roomsAvailable: 0, lowAvailability: false, loading: false, error: "" });

  useEffect(() => {
    if (!checkIn || !checkOut) return;

    setStatus((s) => ({ ...s, loading: true, error: "" }));

    fetch(`/api/hotels/${hotelId}/availability?checkIn=${checkIn}&checkOut=${checkOut}`)
      .then((r) => r.json())
      .then((data) => {
        setStatus({
          available:       data.available,
          roomsAvailable:  data.roomsAvailable,
          lowAvailability: data.lowAvailability,
          loading:         false,
          error:           data.available === false && !data.lowAvailability ? (data.reason || "Sin disponibilidad") : "",
        });
        onAvailabilityChange?.(data.available, data.roomsAvailable);
      })
      .catch(() => {
        setStatus((s) => ({ ...s, loading: false }));
      });
  }, [hotelId, checkIn, checkOut]);

  if (status.loading) {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
        <p className="text-xs text-stone-500">Verificando disponibilidad...</p>
      </div>
    );
  }

  if (!status.available) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
        <p className="text-sm font-bold text-rose-700">❌ Sin disponibilidad</p>
        <p className="text-xs text-rose-500 mt-0.5">{status.error}</p>
      </div>
    );
  }

  if (status.lowAvailability) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <p className="text-sm font-bold text-amber-700">⚠️ ¡Últimas habitaciones!</p>
        <p className="text-xs text-amber-600 mt-0.5">
          Solo quedan <strong>{status.roomsAvailable}</strong> habitación{status.roomsAvailable === 1 ? "" : "es"} disponible{status.roomsAvailable === 1 ? "" : "s"}
        </p>
      </div>
    );
  }

  if (rooms > status.roomsAvailable) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
        <p className="text-sm font-bold text-rose-700">❌ No hay suficientes habitaciones</p>
        <p className="text-xs text-rose-500 mt-0.5">
          Disponibles: {status.roomsAvailable} · Solicitadas: {rooms}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
      <p className="text-sm font-bold text-teal-700">✅ Disponible</p>
      <p className="text-xs text-teal-600 mt-0.5">
        {status.roomsAvailable} habitación{status.roomsAvailable === 1 ? "" : "es"} disponible{status.roomsAvailable === 1 ? "" : "s"}
      </p>
    </div>
  );
}
