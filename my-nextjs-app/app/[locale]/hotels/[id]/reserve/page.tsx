"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type Hotel = {
  id: string;
  name: string;
  price: number;
  totalRooms: number;
};

type ExtraOption = {
  id: "BREAKFAST" | "SPA" | "TOUR" | "TRANSPORT";
  price: number;
  icon: string;
};

const EXTRA_OPTIONS: ExtraOption[] = [
  { id: "BREAKFAST", price: 20, icon: "🍳" },
  { id: "SPA", price: 80, icon: "💆‍♀️" },
  { id: "TOUR", price: 50, icon: "🗺️" },
  { id: "TRANSPORT", price: 40, icon: "🚐" },
];

export default function ReservePage() {
  const params = useParams();
  const hotelId = params.id as string;
  const router = useRouter();
  const t = useTranslations("reserve");

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/hotels/${hotelId}`)
      .then((r) => r.json())
      .then((data) => {
        setHotel(data);
        setLoading(false);
      })
      .catch(() => {
        setError(t("error"));
        setLoading(false);
      });
  }, [hotelId, t]);

  const handleToggleExtra = (id: string) => {
    const newSet = new Set(selectedExtras);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedExtras(newSet);
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diffTime = outDate.getTime() - inDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const nights = calculateNights();
  const basePrice = hotel ? hotel.price * nights * rooms : 0;
  
  const extrasTotal = Array.from(selectedExtras).reduce((sum, id) => {
    const option = EXTRA_OPTIONS.find(o => o.id === id);
    return sum + (option ? option.price : 0);
  }, 0);

  const totalPrice = basePrice + extrasTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nights <= 0) {
      setError(t("invalidDates"));
      return;
    }
    setIsSubmitting(true);
    setError("");

    const extrasPayload = Array.from(selectedExtras).map(id => {
      const option = EXTRA_OPTIONS.find(o => o.id === id);
      return { type: id, price: option?.price || 0, quantity: 1 };
    });

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId,
          checkIn,
          checkOut,
          guests,
          rooms,
          extras: extrasPayload
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("error"));
        setIsSubmitting(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError(t("error"));
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#EEF0EB] p-10 text-center">{t("processing")}</div>;
  if (!hotel) return <div className="min-h-screen bg-[#EEF0EB] p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#EEF0EB] text-[#153243] py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Link href={`/hotels/${hotelId}`} className="text-[#284B63] font-semibold text-sm hover:underline mb-6 inline-block">
          ← {hotel.name}
        </Link>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-8">{t("title")}</h1>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            
            {/* Dates & Guests */}
            <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#153243]/10 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Detalles de estadía</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">{t("checkIn")}</label>
                  <input type="date" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-[#EEF0EB] border-transparent rounded-xl px-4 py-3 focus:border-[#284B63] focus:ring-0" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">{t("checkOut")}</label>
                  <input type="date" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-[#EEF0EB] border-transparent rounded-xl px-4 py-3 focus:border-[#284B63] focus:ring-0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">{t("guests")}</label>
                  <input type="number" min="1" max="4" required value={guests} onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full bg-[#EEF0EB] border-transparent rounded-xl px-4 py-3 focus:border-[#284B63] focus:ring-0" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">{t("rooms")}</label>
                  <input type="number" min="1" max={hotel.totalRooms} required value={rooms} onChange={(e) => setRooms(Number(e.target.value))}
                    className="w-full bg-[#EEF0EB] border-transparent rounded-xl px-4 py-3 focus:border-[#284B63] focus:ring-0" />
                </div>
              </div>
            </section>

            {/* Extra Packages */}
            <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#153243]/10 shadow-sm">
              <h2 className="text-xl font-bold mb-2">{t("extraPackages")}</h2>
              <p className="text-sm text-stone-500 mb-6">{t("selectExtras")}</p>

              <div className="space-y-3">
                {EXTRA_OPTIONS.map((opt) => (
                  <label key={opt.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-colors ${selectedExtras.has(opt.id) ? "border-[#284B63] bg-[#F4F9E9]" : "border-transparent bg-[#EEF0EB] hover:bg-stone-200"}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="font-semibold text-slate-800">{t(`extra_${opt.id}`)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-[#284B63]">+${opt.price}</span>
                      <input type="checkbox" checked={selectedExtras.has(opt.id)} onChange={() => handleToggleExtra(opt.id)} className="w-5 h-5 rounded text-[#284B63] focus:ring-[#284B63]" />
                    </div>
                  </label>
                ))}
              </div>
            </section>

          </div>

          {/* Sidebar Summary */}
          <div className="md:col-span-1">
            <div className="bg-[#284B63] text-white p-6 sm:p-8 rounded-3xl shadow-lg sticky top-8">
              <h3 className="text-xl font-bold mb-6">{t("priceSummary")}</h3>
              
              <div className="space-y-4 mb-6 text-sm font-medium">
                <div className="flex justify-between items-center opacity-80">
                  <span>{hotel.price} x {nights} noches x {rooms} hab.</span>
                  <span>${basePrice.toLocaleString()}</span>
                </div>
                {Array.from(selectedExtras).map(id => {
                  const opt = EXTRA_OPTIONS.find(o => o.id === id);
                  if (!opt) return null;
                  return (
                    <div key={id} className="flex justify-between items-center opacity-80">
                      <span>{t(`extra_${id}`)}</span>
                      <span>${opt.price.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-white/20 pt-6 mb-8 flex justify-between items-end">
                <span className="text-sm font-bold opacity-80">{t("total")}</span>
                <span className="text-3xl font-black">${totalPrice.toLocaleString()}</span>
              </div>

              {error && <div className="bg-red-500/20 text-red-100 p-3 rounded-xl mb-4 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={isSubmitting || nights <= 0}
                className="w-full bg-[#F4F9E9] text-[#153243] font-black text-lg py-4 rounded-xl shadow-md hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t("processing") : t("confirm")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
