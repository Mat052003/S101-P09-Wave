"use client";
// app/components/AvailabilityCalendar.tsx
// Calendario para que el anfitrión bloquee/desbloquee fechas

import { useEffect, useState } from "react";

interface Props {
  hotelId: string;
}

type BlockedDate = {
  id: string;
  date: string;
  reason: string | null;
};

export default function AvailabilityCalendar({ hotelId }: Props) {
  const today       = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [blocked, setBlocked] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason]   = useState("");

  const monthName = new Date(year, month).toLocaleString("es-CL", { month: "long", year: "numeric" });

  function loadBlocked() {
    fetch(`/api/admin/hotels/${hotelId}/blocked-dates`)
      .then((r) => r.json())
      .then((data) => { setBlocked(data || []); setLoading(false); });
  }

  useEffect(() => { loadBlocked(); }, [hotelId]);

  // Generar días del mes
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks     = Array(firstDay).fill(null);
  const days       = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  function isBlocked(day: number) {
    const d = new Date(year, month, day).toISOString().split("T")[0];
    return blocked.some((b) => b.date.startsWith(d));
  }

  function isPast(day: number) {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  }

  async function toggleDate(day: number) {
    if (isPast(day)) return;
    const date = new Date(year, month, day).toISOString();
    const blocked_day = isBlocked(day);

    if (blocked_day) {
      await fetch(`/api/admin/hotels/${hotelId}/blocked-dates`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
    } else {
      await fetch(`/api/admin/hotels/${hotelId}/blocked-dates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, reason: reason || null }),
      });
    }
    loadBlocked();
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">
      <div>
        <h3 className="font-bold text-slate-900 text-lg">Calendario de disponibilidad</h3>
        <p className="text-xs text-stone-500 mt-1">Haz clic en un día para bloquearlo o desbloquearlo</p>
      </div>

      {/* Motivo opcional */}
      <div className="flex gap-2">
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo del bloqueo (opcional)"
          className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400"
        />
      </div>

      {/* Navegación mes */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth}
          className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-slate-700 font-bold transition-colors">
          ‹
        </button>
        <p className="font-bold text-slate-900 capitalize">{monthName}</p>
        <button onClick={nextMonth}
          className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-slate-700 font-bold transition-colors">
          ›
        </button>
      </div>

      {/* Días semana */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map((d) => (
          <div key={d} className="text-xs font-bold text-stone-400 py-1">{d}</div>
        ))}

        {blanks.map((_, i) => <div key={`b-${i}`} />)}

        {days.map((day) => {
          const past    = isPast(day);
          const blocked = isBlocked(day);
          return (
            <button
              key={day}
              onClick={() => toggleDate(day)}
              disabled={past}
              className={`aspect-square rounded-xl text-sm font-semibold transition-all ${
                past
                  ? "text-stone-300 cursor-not-allowed"
                  : blocked
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "bg-stone-50 text-slate-700 hover:bg-teal-100 hover:text-teal-700"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 text-xs text-stone-500 pt-2 border-t border-stone-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-stone-50 border border-stone-200" />
          Disponible
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-rose-500" />
          Bloqueado
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-stone-200" />
          Pasado
        </div>
      </div>

      {/* Lista de fechas bloqueadas */}
      {blocked.length > 0 && (
        <div className="pt-4 border-t border-stone-100">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
            Fechas bloqueadas ({blocked.length})
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {blocked
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((b) => (
                <div key={b.id} className="flex items-center justify-between bg-rose-50 rounded-xl px-3 py-2">
                  <div>
                    <p className="text-xs font-bold text-rose-700">
                      {new Date(b.date).toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                    {b.reason && <p className="text-xs text-rose-500">{b.reason}</p>}
                  </div>
                  <button
                    onClick={() => toggleDate(new Date(b.date).getDate())}
                    className="text-xs text-rose-500 hover:text-rose-700 font-bold"
                  >
                    Desbloquear
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
