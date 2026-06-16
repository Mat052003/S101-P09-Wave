"use client";
// app/components/StarRating.tsx

interface Props {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
}

export default function StarRating({ value, onChange, size = "md", readOnly = false }: Props) {
  const sizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={`${sizes[size]} transition-all ${
            n <= value ? "text-amber-400" : "text-stone-300"
          } ${!readOnly && "hover:scale-110 cursor-pointer"}`}
          aria-label={`${n} estrellas`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
