"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { formatVND } from "@/lib/format"
import type { CategoryBreakdownItem } from "@/lib/data/stats"

export function CategoryPieChart({ data }: { data: CategoryBreakdownItem[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Chưa có chi tiêu nào trong tháng này.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="name"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.categoryId ?? "none"} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatVND(Number(value))} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="space-y-1 text-sm">
        {data.map((item) => (
          <li
            key={item.categoryId ?? "none"}
            className="flex items-center justify-between gap-2"
          >
            <span className="flex items-center gap-2 truncate">
              <span
                className="inline-block size-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </span>
            <span className="shrink-0 font-medium">{formatVND(item.total)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
