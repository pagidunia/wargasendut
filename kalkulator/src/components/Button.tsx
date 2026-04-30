"use client";

type Variant = "number" | "operator" | "equals" | "clear";

type Props = {
  label: string;
  onClick: () => void;
  variant?: Variant;
  className?: string;
};

const styles: Record<Variant, string> = {
  number: "bg-gray-200 hover:bg-gray-300 text-gray-800",
  operator: "bg-orange-500 hover:bg-orange-600 text-white",
  equals: "bg-blue-500 hover:bg-blue-600 text-white",
  clear: "bg-red-500 hover:bg-red-600 text-white",
};

export default function Button({
  label,
  onClick,
  variant = "number",
  className = "",
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`${styles[variant]} text-xl font-bold py-4 rounded-xl transition-colors ${className}`}
    >
      {label}
    </button>
  );
}
