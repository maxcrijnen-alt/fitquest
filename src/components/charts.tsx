"use client";

import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function StrengthVolumeChart({ data }: { data: { date: string; volume: number }[] }) {
  const hydrated = useHydrated();
  if (!hydrated || !data.length) return <ChartEmpty />;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#d4d4d8" }} />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="#059669"
            strokeWidth={2}
            fill="url(#volumeFill)"
            name="Volume"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RunningProgressChart({
  data,
}: {
  data: { date: string; distance: number; pace: number }[];
}) {
  const hydrated = useHydrated();
  if (!hydrated || !data.length) return <ChartEmpty />;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <LineChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
          <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#71717a", fontSize: 12 }}
          />
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#d4d4d8" }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="distance"
            stroke="#0f766e"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Distance km"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="pace"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Pace min/km"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeeklyCompletionChart({
  data,
}: {
  data: { day: string; completed: number; total: number }[];
}) {
  const hydrated = useHydrated();
  if (!hydrated || !data.length) return <ChartEmpty />;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <BarChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 12 }} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#d4d4d8" }} />
          <Bar dataKey="completed" fill="#10b981" radius={[6, 6, 0, 0]} name="Completed" />
          <Bar dataKey="total" fill="#d4d4d8" radius={[6, 6, 0, 0]} name="Total" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RelativeStrengthChart({
  data,
}: {
  data: {
    name: string;
    relativeStrength: number;
    ageAdjustedStrength: number;
    weightClass: string;
  }[];
}) {
  const hydrated = useHydrated();
  if (!hydrated || !data.length) return <ChartEmpty />;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <BarChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, borderColor: "#d4d4d8" }}
            formatter={(value, name) => [
              value,
              name === "relativeStrength" ? "Weighted bodyweight index" : "Weighted age-adjusted index",
            ]}
            labelFormatter={(label, payload) => {
              const item = payload?.[0]?.payload;
              return item ? `${label} / ${item.weightClass} class` : label;
            }}
          />
          <Bar dataKey="relativeStrength" fill="#10b981" radius={[6, 6, 0, 0]} />
          <Bar dataKey="ageAdjustedStrength" fill="#f59e0b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartEmpty() {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-sm font-medium text-zinc-500">
      No chart data yet
    </div>
  );
}

function useHydrated() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}
