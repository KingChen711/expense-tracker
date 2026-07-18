import { createClient } from "@/lib/supabase/server"
import type { DateRange } from "@/lib/data/dashboard"

export interface CategoryBreakdownItem {
  categoryId: string | null
  name: string
  color: string
  total: number
}

export interface MonthlyTrendItem {
  month: string
  label: string
  income: number
  expense: number
}

const MONTH_LABELS = [
  "T1", "T2", "T3", "T4", "T5", "T6",
  "T7", "T8", "T9", "T10", "T11", "T12",
]

export async function getCategoryBreakdown(
  range: DateRange
): Promise<CategoryBreakdownItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("transactions")
    .select("amount, category:categories(id, name, color)")
    .eq("type", "expense")
    .gte("occurred_on", range.from)
    .lte("occurred_on", range.to)

  if (error) throw error

  type Row = {
    amount: number
    category: { id: string; name: string; color: string } | null
  }

  const map = new Map<string, CategoryBreakdownItem>()
  for (const row of (data ?? []) as unknown as Row[]) {
    const key = row.category?.id ?? "none"
    const existing = map.get(key)
    if (existing) {
      existing.total += row.amount
    } else {
      map.set(key, {
        categoryId: row.category?.id ?? null,
        name: row.category?.name ?? "Không danh mục",
        color: row.category?.color ?? "#6b7280",
        total: row.amount,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => b.total - a.total)
}

export async function getMonthlyTrend(
  monthsBack = 6,
  refDate: Date = new Date()
): Promise<MonthlyTrendItem[]> {
  const supabase = await createClient()
  const rangeStart = new Date(
    refDate.getFullYear(),
    refDate.getMonth() - (monthsBack - 1),
    1
  )
  const rangeEnd = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1)

  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount, occurred_on")
    .gte("occurred_on", rangeStart.toISOString().slice(0, 10))
    .lt("occurred_on", rangeEnd.toISOString().slice(0, 10))

  if (error) throw error

  const buckets: MonthlyTrendItem[] = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1)
    buckets.push({
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: `${MONTH_LABELS[d.getMonth()]}/${d.getFullYear()}`,
      income: 0,
      expense: 0,
    })
  }

  for (const row of data ?? []) {
    const d = new Date(row.occurred_on)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const bucket = buckets.find((b) => b.month === key)
    if (!bucket) continue
    if (row.type === "income") bucket.income += row.amount
    else bucket.expense += row.amount
  }

  return buckets
}
