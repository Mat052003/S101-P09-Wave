"use client";
// app/components/HomeSearchForm.tsx

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import LocationAutocomplete from "./LocationAutocomplete";
import { useTranslations } from "next-intl";

export default function HomeSearchForm() {
  const router = useRouter();
  const t = useTranslations("searchForm");
  const [location, setLocation]     = useState("");
  const [checkIn, setCheckIn]       = useState("");
  const [checkOut, setCheckOut]     = useState("");
  const [adults, setAdults]         = useState(2);
  const [children, setChildren]     = useState(0);
  const [rooms, setRooms]           = useState(1);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (adults) params.set("adults", adults.toString());
    if (children) params.set("children", children.toString());
    if (rooms) params.set("rooms", rooms.toString());

    router.push(`/hotels?${params.toString()}`);
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-[#F4F9E9] rounded-3xl shadow-2xl p-7 md:p-9 max-w-md w-full">

      <div className="mb-6">
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#153243] leading-tight tracking-tight"
            dangerouslySetInnerHTML={{ __html: t.raw("title") }}>
        </h2>
        <p className="text-sm text-[#284B63]/85 mt-3 leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      <form onSubmit={handleSearch} className="space-y-3">

        {/* Ubicación con autocompletado */}
        <LocationAutocomplete value={location} onChange={setLocation} />

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border-2 border-[#153243]/15 bg-white px-4 py-3 hover:border-[#153243]/30 focus-within:border-[#153243] transition-colors">
            <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#284B63]">
              {t("checkIn")}
            </label>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent text-sm text-[#153243] outline-none mt-1"
            />
          </div>
          <div className="rounded-2xl border-2 border-[#153243]/15 bg-white px-4 py-3 hover:border-[#153243]/30 focus-within:border-[#153243] transition-colors">
            <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#284B63]">
              {t("checkOut")}
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent text-sm text-[#153243] outline-none mt-1"
            />
          </div>
        </div>

        {/* Adultos / Niños */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border-2 border-[#153243]/15 bg-white px-4 py-3 hover:border-[#153243]/30 focus-within:border-[#153243] transition-colors">
            <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#284B63]">
              {t("adults")}
            </label>
            <select
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="w-full bg-transparent text-sm text-[#153243] outline-none mt-1 cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="rounded-2xl border-2 border-[#153243]/15 bg-white px-4 py-3 hover:border-[#153243]/30 focus-within:border-[#153243] transition-colors">
            <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#284B63]">
              {t("children")}
            </label>
            <select
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className="w-full bg-transparent text-sm text-[#153243] outline-none mt-1 cursor-pointer"
            >
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Habitaciones */}
        <div className="rounded-2xl border-2 border-[#153243]/15 bg-white px-4 py-3 hover:border-[#153243]/30 focus-within:border-[#153243] transition-colors">
          <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#284B63]">
            {t("rooms")}
          </label>
          <select
            value={rooms}
            onChange={(e) => setRooms(Number(e.target.value))}
            className="w-full bg-transparent text-sm text-[#153243] outline-none mt-1 cursor-pointer"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? t("room_singular") : t("room_plural")}</option>
            ))}
          </select>
        </div>

        {/* Botón Buscar */}
        <button
          type="submit"
          className="w-full bg-[#153243] hover:bg-[#284B63] text-[#F4F9E9] font-bold py-4 rounded-2xl transition-colors text-base shadow-lg mt-2"
        >
          {t("searchBtn")} →
        </button>
      </form>
    </div>
  );
}
