import { createClient } from "@/lib/supabase/server"

export interface ExportData {
  exportedAt: string
  categories: {
    id: string
    name: string
    type: string
    color: string
  }[]
  transactions: {
    id: string
    category_id: string | null
    type: string
    amount: number
    occurred_on: string
    note: string | null
  }[]
  budgets: {
    id: string
    category_id: string
    month: string
    limit_amount: number
  }[]
  recurring_templates: {
    id: string
    category_id: string | null
    type: string
    amount: number
    note: string | null
    day_of_month: number
    start_date: string
    last_generated_on: string | null
    active: boolean
  }[]
  debts: {
    id: string
    creditor_name: string
    total_amount: number
    due_date: string | null
    note: string | null
    status: string
  }[]
  debt_payments: {
    id: string
    debt_id: string
    amount: number
    paid_on: string
    note: string | null
  }[]
}

export async function getExportData(): Promise<ExportData> {
  const supabase = await createClient()

  const [
    { data: categories, error: categoriesError },
    { data: transactions, error: transactionsError },
    { data: budgets, error: budgetsError },
    { data: recurringTemplates, error: recurringError },
    { data: debts, error: debtsError },
    { data: debtPayments, error: debtPaymentsError },
  ] = await Promise.all([
    supabase.from("categories").select("id, name, type, color"),
    supabase
      .from("transactions")
      .select("id, category_id, type, amount, occurred_on, note"),
    supabase.from("budgets").select("id, category_id, month, limit_amount"),
    supabase
      .from("recurring_templates")
      .select(
        "id, category_id, type, amount, note, day_of_month, start_date, last_generated_on, active"
      ),
    supabase
      .from("debts")
      .select("id, creditor_name, total_amount, due_date, note, status"),
    supabase.from("debt_payments").select("id, debt_id, amount, paid_on, note"),
  ])

  if (categoriesError) throw categoriesError
  if (transactionsError) throw transactionsError
  if (budgetsError) throw budgetsError
  if (recurringError) throw recurringError
  if (debtsError) throw debtsError
  if (debtPaymentsError) throw debtPaymentsError

  return {
    exportedAt: new Date().toISOString(),
    categories: categories ?? [],
    transactions: transactions ?? [],
    budgets: budgets ?? [],
    recurring_templates: recurringTemplates ?? [],
    debts: debts ?? [],
    debt_payments: debtPayments ?? [],
  }
}

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function transactionsToCSV(
  transactions: ExportData["transactions"],
  categories: ExportData["categories"]
): string {
  const categoryById = new Map(categories.map((c) => [c.id, c.name]))
  const header = ["Ngày", "Loại", "Danh mục", "Số tiền", "Ghi chú"]
  const rows = transactions.map((t) => [
    t.occurred_on,
    t.type === "income" ? "Thu nhập" : "Chi tiêu",
    t.category_id ? (categoryById.get(t.category_id) ?? "") : "",
    t.amount,
    t.note ?? "",
  ])

  return [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n")
}
