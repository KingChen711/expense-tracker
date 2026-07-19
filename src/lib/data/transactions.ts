import { createClient } from "@/lib/supabase/server"
import type { Transaction, TransactionType } from "@/lib/types"

export interface TransactionFilters {
  from?: string
  to?: string
  type?: TransactionType
  categoryId?: string
  q?: string
}

export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<Transaction[]> {
  const supabase = await createClient()
  let query = supabase
    .from("transactions")
    .select(
      "id, category_id, type, amount, occurred_on, note, category:categories(id, name, type, color)"
    )
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false })

  if (filters.from) query = query.gte("occurred_on", filters.from)
  if (filters.to) query = query.lte("occurred_on", filters.to)
  if (filters.type) query = query.eq("type", filters.type)
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId)

  const { data, error } = await query
  if (error) throw error

  let transactions = (data ?? []) as unknown as Transaction[]

  if (filters.q) {
    const q = filters.q.trim().toLowerCase()
    if (q) {
      transactions = transactions.filter(
        (t) =>
          t.note?.toLowerCase().includes(q) ||
          t.category?.name.toLowerCase().includes(q)
      )
    }
  }

  return transactions
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, category_id, type, amount, occurred_on, note, category:categories(id, name, type, color)"
    )
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data as unknown as Transaction | null
}

export async function getRecentCategoryIds(limit = 6): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("transactions")
    .select("category_id")
    .not("category_id", "is", null)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit * 3)

  if (error) throw error

  const seen = new Set<string>()
  for (const row of data ?? []) {
    if (row.category_id) seen.add(row.category_id)
    if (seen.size === limit) break
  }
  return Array.from(seen)
}
