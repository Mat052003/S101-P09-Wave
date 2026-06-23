"use client";
// app/components/HomeSearchForm.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import LocationAutocomplete from "./LocationAutocomplete";

export default function HomeSearchForm() {
  const router = useRouter();

  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn]   = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults]     = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms]       = useState(1);

  const today = new Date().toISOString().split("T")[0];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (checkIn)         params.set("checkIn", checkIn);
    if (checkOut)        params.set("checkOut", checkOut);
    params.set("adults",   adults.toString());
    params.set("children", children.toString());
    params.set("rooms",    rooms.toString());
    router.push(`/hotels?${params.toString()}`);
  }

  const inputClass = "w-full bg-white/90 border border-[#0B1F2D]/10 rounded-xl px-3 py-2 text-sm text-[#0B1F2D] placeholder-[#0B1F2D]/35 outline-none focus:border-[#C9A87C] focus:ring-2 focus:ring-[#C9A87C]/20 transition-all";
  const labelClass = "block text-[9px] font-bold uppercase tracking-[0.18em] text-[#0B1F2D]/45 mb-1";

  return (
    <div className="bg-[#FAF6F0]/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-[#0B1F2D]/30 p-5 md:p-6 max-w-md w-full border border-white/40">
      {/* Header compacto */}
      <div className="mb-5">
        <p className="text-[#C9A87C] text-[9px] font-semibold uppercase tracking-[0.35em] mb-1.5">
          Boutique Hotels · Chile
        </p>
        <h2 className="font-display text-2xl font-bold text-[#0B1F2D] leading-tight">
          Encuentra tu
          <span className="italic text-[#1B4965]"> estadía perfecta</span>
        </h2>
      </div>

      <form onSubmit={handleSearch} className="space-y-2.5">

        {/* Ubicación */}
        <div>
          <label className={labelClass}>Destino</label>
          <LocationAutocomplete value={location} onChange={setLocation} placeholder="Santiago, Pucón, Atacama..." />
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Llegada</label>
            <input type="date" value={checkIn} min={today}
              onChange={(e) => setCheckIn(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Salida</label>
            <input type="date" value={checkOut} min={checkIn || today}
              onChange={(e) => setCheckOut(e.target.value)} className={inputClass} />
          </div>
        </div>

        {/* Adultos / Niños */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Adultos</label>
            <select value={adults} onChange={(e) => setAdults(Number(e.target.value))} className={inputClass}>
              {[1,2,3,4,5,6,7,8].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Niños</label>
            <select value={children} onChange={(e) => setChildren(Number(e.target.value))} className={inputClass}>
              {[0,1,2,3,4].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Habitaciones */}
        <div>
          <label className={labelClass}>Habitaciones</label>
          <select value={rooms} onChange={(e) => setRooms(Number(e.target.value))} className={inputClass}>
            {[1,2,3,4,5].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? "habitación" : "habitaciones"}</option>
            ))}
          </select>
        </div>

        <button type="submit"
          className="w-full bg-[#0B1F2D] hover:bg-[#1B4965] text-[#FAF6F0] font-bold py-3 rounded-2xl transition-colors text-sm tracking-wide mt-1">
          Buscar hoteles →
        </button>
      </form>
    </div>
  );
}