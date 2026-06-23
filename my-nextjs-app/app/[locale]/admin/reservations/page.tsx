"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type Reservation = {
  id: string;
  hotel: { name: string };
  user: { name: string; email: string };
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  extras: { type: string; price: number; quantity: number }[];
};

export default function AdminReservationsPage() {
  const t = useTranslations("adminReservations");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reservations")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReservations(data);
        setLoading(false);
      });
  }, []);

  const getStatusColor = (status: string) => {
    if (status === "CONFIRMED") return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (status === "PENDING") return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-rose-100 text-rose-800 border-rose-200";
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-teal-600 font-bold text-sm mb-2 inline-block hover:underline">← Volver al Panel Admin</Link>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{t("title")}</h1>
            <p className="text-stone-500 mt-2 text-sm">{t("subtitle")}</p>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20 text-stone-500">{t("loading")}</div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-slate-900">{t("noReservations")}</h3>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">{t("guest")}</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">{t("hotel")}</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">{t("dates")}</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">{t("extras")}</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">{t("total")}</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">{t("status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{res.user.name || "Usuario"}</div>
                        <div className="text-xs text-stone-500">{res.user.email}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {res.hotel.name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-800">{new Date(res.checkIn).toLocaleDateString()}</div>
                        <div className="text-xs text-stone-500">→ {new Date(res.checkOut).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        {res.extras.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {res.extras.map((e, i) => (
                              <span key={i} className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-100 rounded-md">
                                {e.type}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400 italic">{t("noExtras")}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">
                        ${res.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(res.status)}`}>
                          {t(res.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
