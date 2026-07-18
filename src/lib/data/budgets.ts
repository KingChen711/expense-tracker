import { createClient } from "@/lib/supabase/server"
import { getCategoryBreakdown } from "@/lib/data/stats"
import type { Category } from "@/lib/types"

export interface BudgetWithSpending {
  id: string
  categoryId: string
  category: Category
  limitAmount: number
  spent: number
}

export interface Budget {
  id: string
  categoryId: string
  category: Category
  limitAmount: number
}

export function currentMonthStart() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
}

function currentMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  }
}

export async function getBudgetsWithSpending(): Promise<BudgetWithSpending[]> {
  const supabase = await createClient()
  const month = currentMonthStart()

  const [{ data: budgets, error }, breakdown] = await Promise.all([
    supabase
      .from("budgets")
      .select(
        "id, category_id, limit_amount, category:categories(id, name, type, color)"
      )
      .eq("month", month),
    getCategoryBreakdown(currentMonthRange()),
  ])

  if (error) throw error

  const spentByCategory = new Map(breakdown.map((b) => [b.categoryId, b.total]))

  type Row = {
    id: string
    category_id: string
    limit_amount: number
    category: Category
  }

  return ((budgets ?? []) as unknown as Row[]).map((b) => ({
    id: b.id,
    categoryId: b.category_id,
    category: b.category,
    limitAmount: b.limit_amount,
    spent: spentByCategory.get(b.category_id) ?? 0,
  }))
}

export async function getBudgetById(id: string): Promise<Budget | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("budgets")
    .select("id, category_id, limit_amount, category:categories(id, name, type, color)")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const row = data as unknown as {
    id: string
    category_id: string
    limit_amount: number
    category: Category
  }

  return {
    id: row.id,
    categoryId: row.category_id,
    category: row.category,
    limitAmount: row.limit_amount,
  }
}

export async function getUnbudgetedExpenseCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const month = currentMonthStart()

  const [{ data: categories, error: catError }, { data: budgets, error: budError }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id, name, type, color")
        .eq("type", "expense")
        .order("name"),
      supabase.from("budgets").select("category_id").eq("month", month),
    ])

  if (catError) throw catError
  if (budError) throw budError

  const budgeted = new Set((budgets ?? []).map((b) => b.category_id))
  return (categories ?? []).filter((c) => !budgeted.has(c.id))
}
