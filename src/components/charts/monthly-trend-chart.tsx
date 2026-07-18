"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatVND } from "@/lib/format"
import type { MonthlyTrendItem } from "@/lib/data/stats"

export function MonthlyTrendChart({ data }: { data: MonthlyTrendItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" fontSize={12} />
        <YAxis
          fontSize={12}
          tickFormatter={(value: number) =>
            new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(value)
          }
        />
        <Tooltip formatter={(value) => formatVND(Number(value))} />
        <Legend
          formatter={(value) => (value === "income" ? "Thu nhập" : "Chi tiêu")}
        />
        <Bar dataKey="income" name="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
