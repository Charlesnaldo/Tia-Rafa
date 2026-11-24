"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";

export type RevenuePoint = { key: string; label: string; cents: number; orders: number };

// Single series (approved revenue per day): the card title names it, so no legend.
// Color, ink and grid follow the dataviz reference palette (series-1 validated on the light surface).
const SERIES = "#2a78d6";
const INK_MUTED = "#52514e";
const GRID = "#e7e6e2";

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: RevenuePoint }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-slate-900">{point.label}</p>
      <p className="text-slate-700">{formatCurrency(point.cents)}</p>
      <p className="text-slate-500">{point.orders} {point.orders === 1 ? "pedido" : "pedidos"}</p>
    </div>
  );
}

export default function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div className="h-64 w-full" role="img" aria-label="Receita aprovada por dia">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: GRID }} tick={{ fill: INK_MUTED, fontSize: 11 }} interval="preserveStartEnd" minTickGap={16} />
          <YAxis tickLine={false} axisLine={false} width={64} tick={{ fill: INK_MUTED, fontSize: 11 }}
            tickFormatter={(value: number) => formatCurrency(value).replace(",00", "")} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(42,120,214,0.08)" }} />
          <Bar dataKey="cents" fill={SERIES} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
