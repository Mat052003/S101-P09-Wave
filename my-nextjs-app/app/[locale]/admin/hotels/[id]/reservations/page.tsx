"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────

type Extra = {
  id: string;
  name?: string | null;
  type?: string | null;
  notes?: string | null;
  price: number;
  quantity: number;
};

type Reservation = {
  id: string;
  hotelId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  user: { name: string | null; email: string };
  extras: Extra[];
};

type CatalogItem = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  kind: "extra" | "experience";
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusStyle(s: string) {
  if (s === "CONFIRMED") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (s === "PENDING")   return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-rose-100 text-rose-800 border-rose-200";
}

function statusLabel(s: string) {
  if (s === "CONFIRMED") return "Confirmada";
  if (s === "PENDING")   return "Pendiente";
  return "Cancelada";
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("es-CL", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function calcNights(checkIn: string, checkOut: string) {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

// ── Drawer ────────────────────────────────────────────────────────────────────

function ReservationDrawer({
  res,
  hotelId,
  onClose,
  onStatusChange,
  onExtraAdded,
}: {
  res: Reservation;
  hotelId: string;
  onClose: () => void;
  onStatusChange: (resId: string, newStatus: Reservation["status"]) => void;
  onExtraAdded: (resId: string, extra: Extra) => void;
}) {
  const [localStatus, setLocalStatus] = useState(res.status);
  const [statusLoading, setStatusLoading] = useState(false);

  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const [pickedId, setPickedId] = useState("");
  const [pickedQty, setPickedQty] = useState(1);
  const [addingExtra, setAddingExtra] = useState(false);

  const [actionError, setActionError] = useState("");

  // Keep localStatus in sync if parent updates res
  useEffect(() => { setLocalStatus(res.status); }, [res.status]);

  // Load catalog of available extras/experiences for this hotel
  useEffect(() => {
    setCatalogLoading(true);
    fetch(`/api/hotels/${hotelId}/experiences-extras`)
      .then((r) => r.json())
      .then((data) => {
        const items: CatalogItem[] = [
          ...(data.extras ?? []).map(
            (e: { id: string; name: string; description?: string | null; price: number }) => ({
              ...e, kind: "extra" as const,
            })
          ),
          ...(data.experiences ?? []).map(
            (e: { id: string; name: string; description?: string | null; price: number }) => ({
              ...e, kind: "experience" as const,
            })
          ),
        ];
        setCatalog(items);
        if (items.length > 0) setPickedId(items[0].id);
      })
      .catch(() => {})
      .finally(() => setCatalogLoading(false));
  }, [hotelId]);

  async function patchStatus(newStatus: "CONFIRMED" | "CANCELLED") {
    setStatusLoading(true);
    setActionError("");
    const r = await fetch(`/api/admin/reservations/${res.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setStatusLoading(false);
    if (r.ok) {
      setLocalStatus(newStatus);
      onStatusChange(res.id, newStatus);
    } else {
      const d = await r.json().catch(() => ({}));
      setActionError(d.error || "Error al cambiar estado");
    }
  }

  async function saveNote() {
    const text = noteText.trim();
    if (!text) return;
    setSavingNote(true);
    setActionError("");
    const r = await fetch(`/api/reservations/${res.id}/extras`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Nota del administrador", notes: text, price: 0, quantity: 1 }),
    });
    setSavingNote(false);
    if (r.ok) {
      const extra: Extra = await r.json();
      onExtraAdded(res.id, extra);
      setNoteText("");
    } else {
      const d = await r.json().catch(() => ({}));
      setActionError(d.error || "Error al guardar nota");
    }
  }

  async function addExtra() {
    const item = catalog.find((c) => c.id === pickedId);
    if (!item) return;
    setAddingExtra(true);
    setActionError("");
    const r = await fetch(`/api/reservations/${res.id}/extras`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(item.kind === "extra" ? { extraServiceId: item.id } : { experienceId: item.id }),
        name:     item.name,
        price:    item.price,
        quantity: pickedQty,
      }),
    });
    setAddingExtra(false);
    if (r.ok) {
      const extra: Extra = await r.json();
      onExtraAdded(res.id, extra);
      setPickedQty(1);
    } else {
      const d = await r.json().catch(() => ({}));
      setActionError(d.error || "Error al agregar extra");
    }
  }

  const n = calcNights(res.checkIn, res.checkOut);

  const FL = "w-full border border-[#0B1F2D]/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/15 transition-all bg-white";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B1F2D]/40 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#0B1F2D]/10 shrink-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#C9A87C] mb-1">
              Detalle de reserva
            </p>
            <h2 className="font-bold text-[#0B1F2D] text-lg leading-snug">
              {res.user.name || "Sin nombre"}
            </h2>
            <p className="text-xs text-[#0B1F2D]/40 mt-0.5">{res.user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#FAF6F0] hover:bg-[#0B1F2D]/8 flex items-center justify-center text-[#0B1F2D]/50 hover:text-[#0B1F2D] transition-colors text-xl font-bold shrink-0 ml-4"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* ── Estado ─────────────────────────────────────────────────── */}
          <div>
            <p className="text-[10px] font-bold text-[#0B1F2D]/40 uppercase tracking-wider mb-3">Estado</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${statusStyle(localStatus)}`}>
                {statusLabel(localStatus)}
              </span>
              {localStatus === "PENDING" && (
                <>
                  <button
                    onClick={() => patchStatus("CONFIRMED")}
                    disabled={statusLoading}
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold transition-colors"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => patchStatus("CANCELLED")}
                    disabled={statusLoading}
                    className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                </>
              )}
              {localStatus === "CONFIRMED" && (
                <button
                  onClick={() => patchStatus("CANCELLED")}
                  disabled={statusLoading}
                  className="px-4 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-50 text-xs font-bold transition-colors"
                >
                  Cancelar reserva
                </button>
              )}
            </div>
          </div>

          {/* ── Datos de estadía ────────────────────────────────────────── */}
          <div className="bg-[#FAF6F0] rounded-2xl p-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-[#0B1F2D]/40 uppercase tracking-wider mb-1">Check-in</p>
              <p className="text-sm font-semibold text-[#0B1F2D]">{fmt(res.checkIn)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#0B1F2D]/40 uppercase tracking-wider mb-1">Check-out</p>
              <p className="text-sm font-semibold text-[#0B1F2D]">{fmt(res.checkOut)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#0B1F2D]/40 uppercase tracking-wider mb-1">Noches</p>
              <p className="text-sm font-semibold text-[#0B1F2D]">{n}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#0B1F2D]/40 uppercase tracking-wider mb-1">Huéspedes / Hab.</p>
              <p className="text-sm font-semibold text-[#0B1F2D]">
                {res.guests} huésped{res.guests !== 1 ? "es" : ""} · {res.rooms} hab.
              </p>
            </div>
          </div>

          {/* ── Extras y experiencias ───────────────────────────────────── */}
          <div>
            <p className="text-[10px] font-bold text-[#0B1F2D]/40 uppercase tracking-wider mb-3">
              Extras y experiencias
            </p>
            {res.extras.length === 0 ? (
              <p className="text-xs text-[#0B1F2D]/30 italic">Sin extras registrados</p>
            ) : (
              <div className="space-y-2">
                {res.extras.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-start justify-between bg-[#FAF6F0] rounded-xl px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#0B1F2D]">
                        {e.name || e.type || "Extra"}
                      </p>
                      {e.notes && (
                        <p className="text-xs text-[#0B1F2D]/40 mt-0.5 italic">{e.notes}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      {e.price > 0 && (
                        <p className="text-xs font-bold text-[#C9A87C]">
                          ${(e.price * e.quantity).toLocaleString()}
                        </p>
                      )}
                      {e.quantity > 1 && (
                        <p className="text-[10px] text-[#0B1F2D]/30">×{e.quantity}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Total ───────────────────────────────────────────────────── */}
          <div className="flex justify-between items-center border-t border-[#0B1F2D]/10 pt-4">
            <span className="text-xs font-bold text-[#0B1F2D]/40 uppercase tracking-wider">Total pagado</span>
            <span className="text-2xl font-black text-[#0B1F2D]">${res.totalPrice.toLocaleString()}</span>
          </div>

          {/* ── Personalizar estadía ────────────────────────────────────── */}
          <div className="border-t border-[#0B1F2D]/10 pt-6 space-y-5">
            <p className="text-[10px] font-bold text-[#0B1F2D]/40 uppercase tracking-wider">
              Personalizar estadía
            </p>

            {/* Nota */}
            <div>
              <label className="block text-xs font-semibold text-[#0B1F2D]/60 mb-2">
                Agregar nota para el cliente
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                placeholder="Ej: Le prepararemos una decoración especial en la habitación..."
                className={`${FL} resize-none`}
              />
              <button
                onClick={saveNote}
                disabled={!noteText.trim() || savingNote}
                className="mt-2 px-4 py-2 text-xs font-bold bg-[#0B1F2D] hover:bg-[#0B1F2D]/80 disabled:bg-[#0B1F2D]/20 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
              >
                {savingNote ? "Guardando..." : "Guardar nota"}
              </button>
            </div>

            {/* Agregar extra */}
            <div>
              <label className="block text-xs font-semibold text-[#0B1F2D]/60 mb-2">
                Agregar extra o experiencia
              </label>
              {catalogLoading ? (
                <p className="text-xs text-[#0B1F2D]/30 italic">Cargando catálogo...</p>
              ) : catalog.length === 0 ? (
                <p className="text-xs text-[#0B1F2D]/30 italic">
                  Este hotel no tiene extras disponibles.
                </p>
              ) : (
                <div className="flex gap-2 items-stretch">
                  <select
                    value={pickedId}
                    onChange={(e) => setPickedId(e.target.value)}
                    className="flex-1 border border-[#0B1F2D]/20 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/15 transition-all bg-white min-w-0"
                  >
                    {catalog.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.kind === "experience" ? "★ " : ""}{item.name} — ${item.price}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={pickedQty}
                    onChange={(e) => setPickedQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 border border-[#0B1F2D]/20 rounded-xl px-2 py-2.5 text-sm text-center outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/15 transition-all bg-white shrink-0"
                  />
                  <button
                    onClick={addExtra}
                    disabled={addingExtra || !pickedId}
                    className="px-4 py-2.5 text-xs font-bold bg-[#C9A87C] hover:bg-[#C9A87C]/80 disabled:bg-[#0B1F2D]/20 text-white rounded-xl transition-colors disabled:cursor-not-allowed shrink-0"
                  >
                    {addingExtra ? "..." : "Agregar"}
                  </button>
                </div>
              )}
            </div>

            {/* Error inline */}
            {actionError && (
              <p className="text-xs text-rose-500 font-medium">{actionError}</p>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HotelReservationsPage() {
  const { id } = useParams<{ id: string }>();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [hotelName, setHotelName]       = useState("");
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [selected, setSelected]         = useState<Reservation | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [resRes, hotelRes] = await Promise.all([
          fetch(`/api/admin/hotels/${id}/reservations`),
          fetch(`/api/admin/hotels`),
        ]);

        if (!resRes.ok) {
          const data = await resRes.json().catch(() => ({}));
          setError(data.error || "Error al cargar reservas");
          return;
        }

        const data: Reservation[] = await resRes.json();
        setReservations(data);

        if (hotelRes.ok) {
          const hotels: { id: string; name: string }[] = await hotelRes.json();
          const match = hotels.find((h) => h.id === id);
          if (match) setHotelName(match.name);
        }
      } catch {
        setError("Error de red");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function handleStatusChange(resId: string, newStatus: Reservation["status"]) {
    setReservations((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, status: newStatus } : r))
    );
    setSelected((prev) =>
      prev?.id === resId ? { ...prev, status: newStatus } : prev
    );
  }

  function handleExtraAdded(resId: string, extra: Extra) {
    setReservations((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, extras: [...r.extras, extra] } : r))
    );
    setSelected((prev) =>
      prev?.id === resId ? { ...prev, extras: [...prev.extras, extra] } : prev
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#FAF6F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">

          {/* Header */}
          <div>
            <Link href="/admin/hotels" className="text-sm text-[#C9A87C] font-bold mb-4 inline-block">
              ← Mis hoteles
            </Link>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#C9A87C] mb-1">
              {hotelName || "Hotel"}
            </p>
            <h1 className="font-display text-3xl font-bold text-[#0B1F2D]">Reservas</h1>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#C9A87C] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl px-6 py-5">
              <p className="text-rose-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && reservations.length === 0 && (
            <div className="bg-white rounded-2xl border border-[#0B1F2D]/10 shadow-sm p-16 text-center">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-lg font-bold text-[#0B1F2D] mb-1">Sin reservas aún</h3>
              <p className="text-sm text-[#0B1F2D]/40">Las reservas de este hotel aparecerán aquí.</p>
            </div>
          )}

          {/* Table */}
          {!loading && !error && reservations.length > 0 && (
            <>
              <p className="text-sm text-[#0B1F2D]/50 font-medium">
                {reservations.length} reserva{reservations.length !== 1 ? "s" : ""} en total ·{" "}
                <span className="text-[#C9A87C] font-bold">
                  ${reservations.reduce((s, r) => s + r.totalPrice, 0).toLocaleString()} USD
                </span>
              </p>

              <div className="bg-white rounded-2xl border border-[#0B1F2D]/10 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#0B1F2D]/8 bg-[#FAF6F0]">
                        <th className="px-6 py-4 text-[10px] font-bold text-[#0B1F2D]/40 uppercase tracking-wider">Huésped</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-[#0B1F2D]/40 uppercase tracking-wider">Fechas</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-[#0B1F2D]/40 uppercase tracking-wider">Hab. / Huésp.</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-[#0B1F2D]/40 uppercase tracking-wider">Extras</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-[#0B1F2D]/40 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-[#0B1F2D]/40 uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0B1F2D]/6">
                      {reservations.map((res) => (
                        <tr
                          key={res.id}
                          onClick={() => setSelected(res)}
                          className={`hover:bg-[#FAF6F0]/80 transition-colors cursor-pointer ${
                            selected?.id === res.id ? "bg-[#C9A87C]/5" : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold text-[#0B1F2D] text-sm">
                              {res.user.name || "Sin nombre"}
                            </p>
                            <p className="text-xs text-[#0B1F2D]/40 mt-0.5">{res.user.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-[#0B1F2D]">{fmt(res.checkIn)}</p>
                            <p className="text-xs text-[#0B1F2D]/40 mt-0.5">→ {fmt(res.checkOut)}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#0B1F2D]/70">
                            {res.rooms} hab. · {res.guests} huésped{res.guests !== 1 ? "es" : ""}
                          </td>
                          <td className="px-6 py-4">
                            {res.extras.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {res.extras.map((e) => (
                                  <span
                                    key={e.id}
                                    className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#C9A87C]/10 text-[#C9A87C] border border-[#C9A87C]/20 rounded-md"
                                  >
                                    {e.name || e.type || "Extra"} ×{e.quantity}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-[#0B1F2D]/30 italic">Sin extras</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-[#0B1F2D]">
                              ${res.totalPrice.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle(res.status)}`}>
                              {statusLabel(res.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Drawer — key forces remount when switching reservations */}
      {selected && (
        <ReservationDrawer
          key={selected.id}
          res={selected}
          hotelId={id}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onExtraAdded={handleExtraAdded}
        />
      )}
    </>
  );
}
