import { createClient } from "@/lib/supabase/server"

export interface DashboardSummary {
  balance: number
  monthIncome: number
  monthExpense: number
}

export interface DateRange {
  from: string
  to: string
}

export async function getDashboardSummary(
  range: DateRange
): Promise<DashboardSummary> {
  const supabase = await createClient()

  const { data: all, error: allError } = await supabase
    .from("transactions")
    .select("type, amount")

  if (allError) throw allError

  const balance = (all ?? []).reduce(
    (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
    0
  )

  const { data: rangeRows, error: rangeError } = await supabase
    .from("transactions")
    .select("type, amount")
    .gte("occurred_on", range.from)
    .lte("occurred_on", range.to)

  if (rangeError) throw rangeError

  const monthIncome = (rangeRows ?? [])
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
  const monthExpense = (rangeRows ?? [])
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  return { balance, monthIncome, monthExpense }
}
