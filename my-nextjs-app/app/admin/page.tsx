"use client";
// app/admin/page.tsx — Dashboard principal

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Stats = {
  totalHotels: number;
  totalReservations: number;
  confirmedReservations: number;
  pendingReservations: number;
  totalRevenue: number;
  avgPrice: number;
  monthlyData: { month: string; reservations: number; revenue: number }[];
  hotelStats: { name: string; reservations: number; revenue: number; occupancy: number }[];
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (r.status === 401) { router.push("/auth/login"); return null; }
        if (r.status === 403) { router.push("/dashboard"); return null; }
        return r.json();
      })
      .then((data) => { if (data) setStats(data); setLoading(false); });
  }, [router]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <p className="text-[#0B1F2D]/40">Cargando dashboard...</p>
      </div>
    );
  }

  if (!stats) return null;

  const maxRevenue = Math.max(...(stats.monthlyData?.map((m) => m.revenue) ?? [1]));
  const maxRes     = Math.max(...(stats.monthlyData?.map((m) => m.reservations) ?? [1]));

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#C9A87C] mb-1">Panel admin</p>
        <h1 className="font-display text-3xl font-bold text-[#0B1F2D]">Dashboard</h1>
        <p className="text-[#0B1F2D]/40 text-sm mt-1">Resumen de tu negocio hotelero</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Hoteles activos",  value: stats.totalHotels,          icon: "🏨", color: "bg-[#0B1F2D]",   text: "text-white" },
          { label: "Total reservas",   value: stats.totalReservations,    icon: "📋", color: "bg-[#C9A87C]",   text: "text-[#0B1F2D]" },
          { label: "Confirmadas",      value: stats.confirmedReservations, icon: "✅", color: "bg-teal-600",    text: "text-white" },
          { label: "Pendientes",       value: stats.pendingReservations,  icon: "⏳", color: "bg-amber-500",   text: "text-white" },
        ].map((kpi) => (
          <div key={kpi.label} className={`${kpi.color} rounded-2xl p-5`}>
            <p className="text-2xl mb-1">{kpi.icon}</p>
            <p className={`text-3xl font-display font-bold ${kpi.text}`}>{kpi.value}</p>
            <p className={`text-xs ${kpi.text} opacity-70 uppercase tracking-wider mt-1`}>{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Ingresos y precio promedio */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border-2 border-[#0B1F2D]/10 p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0B1F2D]/40 mb-1">Ingresos totales</p>
          <p className="font-display text-4xl font-bold text-[#0B1F2D]">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-[#0B1F2D]/40 mt-1">USD acumulado</p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-[#0B1F2D]/10 p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0B1F2D]/40 mb-1">Precio promedio</p>
          <p className="font-display text-4xl font-bold text-[#0B1F2D]">${stats.avgPrice.toFixed(0)}</p>
          <p className="text-xs text-[#0B1F2D]/40 mt-1">Por noche</p>
        </div>
      </div>

      {/* Gráfica de reservas por mes */}
      {stats.monthlyData?.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-[#0B1F2D]/10 p-6">
          <h2 className="font-display text-xl font-bold text-[#0B1F2D] mb-6">Reservas por mes</h2>
          <div className="flex items-end gap-2 h-40">
            {stats.monthlyData.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-[#0B1F2D]/40 font-bold">{m.reservations}</span>
                <div
                  className="w-full bg-[#0B1F2D] rounded-t-lg transition-all hover:bg-[#1B4965]"
                  style={{ height: `${Math.max(4, (m.reservations / maxRes) * 120)}px` }}
                  title={`${m.reservations} reservas`}
                />
                <span className="text-[10px] text-[#0B1F2D]/40 truncate w-full text-center">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráfica de ingresos por mes */}
      {stats.monthlyData?.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-[#0B1F2D]/10 p-6">
          <h2 className="font-display text-xl font-bold text-[#0B1F2D] mb-6">Ingresos por mes (USD)</h2>
          <div className="flex items-end gap-2 h-40">
            {stats.monthlyData.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-[#0B1F2D]/40 font-bold">
                  {m.revenue > 0 ? `$${(m.revenue / 1000).toFixed(1)}k` : "0"}
                </span>
                <div
                  className="w-full bg-[#C9A87C] rounded-t-lg hover:bg-[#E8845A] transition-all"
                  style={{ height: `${Math.max(4, (m.revenue / maxRevenue) * 120)}px` }}
                  title={`$${m.revenue}`}
                />
                <span className="text-[10px] text-[#0B1F2D]/40 truncate w-full text-center">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rendimiento por hotel */}
      {stats.hotelStats?.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-[#0B1F2D]/10 p-6">
          <h2 className="font-display text-xl font-bold text-[#0B1F2D] mb-4">Rendimiento por hotel</h2>
          <div className="space-y-3">
            {stats.hotelStats.map((h) => (
              <div key={h.name} className="flex items-center gap-4 p-3 bg-[#FAF6F0] rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#0B1F2D] truncate">{h.name}</p>
                  <p className="text-xs text-[#0B1F2D]/40">{h.reservations} reservas · ${h.revenue.toLocaleString()} USD</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[#0B1F2D]">{h.occupancy.toFixed(0)}%</p>
                  <p className="text-[10px] text-[#0B1F2D]/40">ocupación</p>
                </div>
                <div className="w-24 bg-[#0B1F2D]/10 rounded-full h-2 shrink-0">
                  <div className="bg-[#C9A87C] h-2 rounded-full" style={{ width: `${Math.min(100, h.occupancy)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Ver mis hoteles",    href: "/admin/hotels",      icon: "🏨" },
          { label: "Agregar hotel",      href: "/admin/hotels/new",  icon: "➕" },
          { label: "Experiencias",       href: "/admin/experiences", icon: "🌟" },
          { label: "Extras",             href: "/admin/extras",      icon: "🎁" },
          { label: "Ver como cliente",   href: "/hotels",            icon: "👁️" },
          { label: "Mi perfil",          href: "/dashboard?view=profile", icon: "👤" },
        ].map((a) => (
          <Link key={a.href} href={a.href}
            className="bg-white border-2 border-[#0B1F2D]/10 hover:border-[#0B1F2D]/30 rounded-2xl p-4 flex items-center gap-3 transition-all hover:shadow-md">
            <span className="text-2xl">{a.icon}</span>
            <span className="text-sm font-semibold text-[#0B1F2D]">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}