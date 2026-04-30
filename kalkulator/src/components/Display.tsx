import type { Operator } from "@/lib/calculate";

type Props = {
  value: string;
  previous: number | null;
  operator: Operator | null;
};

export default function Display({ value, previous, operator }: Props) {
  return (
    <div className="bg-gray-900 text-white rounded-2xl p-6 mb-4 text-right">
      <div className="text-sm text-gray-400 h-5">
        {previous !== null && operator ? `${previous} ${operator}` : "\u00A0"}
      </div>
      <div className="text-4xl font-bold truncate">{value}</div>
    </div>
  );
}
