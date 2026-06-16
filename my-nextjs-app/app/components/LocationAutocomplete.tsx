"use client";
// app/components/LocationAutocomplete.tsx

import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function LocationAutocomplete({ value, onChange, placeholder }: Props) {
  const [locations, setLocations] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Cargar lista de ubicaciones disponibles al montar
  useEffect(() => {
    fetch("/api/hotels/locations")
      .then((r) => r.json())
      .then((data) => setLocations(data.locations || []))
      .catch(() => {});
  }, []);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrar sugerencias según lo que escribe el usuario
  useEffect(() => {
    if (!value.trim()) {
      setSuggestions(locations.slice(0, 6));
    } else {
      const filtered = locations.filter((loc) =>
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 6));
    }
  }, [value, locations]);

  function handleSelect(loc: string) {
    onChange(loc);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="rounded-2xl border-2 border-[#153243]/15 bg-white px-4 py-3 hover:border-[#153243]/30 focus-within:border-[#153243] transition-colors">
        <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#284B63]">
          Ubicación
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder ?? "Santiago, Pucón, Atacama..."}
          className="w-full bg-transparent text-sm text-[#153243] placeholder-[#284B63]/40 outline-none mt-1"
          autoComplete="off"
        />
      </div>

      {/* Dropdown de sugerencias */}
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#153243]/15 rounded-2xl shadow-xl py-2 z-50 max-h-72 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#284B63]/60 px-4 py-2">
            {value.trim() ? "Sugerencias" : "Destinos populares"}
          </p>
          {suggestions.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => handleSelect(loc)}
              className="w-full text-left px-4 py-2.5 text-sm text-[#153243] hover:bg-[#EEF0EB] transition-colors flex items-center gap-3"
            >
              <span className="text-[#284B63]">📍</span>
              <span className="font-medium">{loc}</span>
            </button>
          ))}
        </div>
      )}

      {/* Sin resultados */}
      {open && value.trim() && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#153243]/15 rounded-2xl shadow-xl py-4 z-50 text-center">
          <p className="text-sm text-[#284B63]/70">No hay hoteles en "{value}"</p>
          <p className="text-xs text-[#284B63]/50 mt-1">Prueba con otra ubicación</p>
        </div>
      )}
    </div>
  );
}
