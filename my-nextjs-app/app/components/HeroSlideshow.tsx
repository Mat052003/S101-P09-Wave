"use client";
// app/components/HeroSlideshow.tsx

import { useEffect, useState } from "react";

const IMAGES = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2400&q=90", // mar turquesa
  "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=2400&q=90", // atardecer playa
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=2400&q=90", // lago montaña
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2400&q=90", // montañas nevadas
  "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=2400&q=90", // bosque niebla
];

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev]       = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrev(current);
      setCurrent((c) => (c + 1) % IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [current]);

  return (
    <div className="absolute inset-0">
      {/* Imagen anterior (fade out) */}
      {prev !== null && (
        <img
          key={`prev-${prev}`}
          src={IMAGES[prev]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-1000"
        />
      )}
      {/* Imagen actual (fade in) */}
      <img
        key={`curr-${current}`}
        src={IMAGES[current]}
        alt="Paisaje natural"
        className="absolute inset-0 w-full h-full object-cover animate-[fadeIn_1.5s_ease-in-out]"
      />

      {/* Dots indicadores */}
      <div className="absolute bottom-6 right-6 z-10 flex gap-2">
        {IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setPrev(current); setCurrent(i); }}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "bg-[#C9A87C] w-4" : "bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}