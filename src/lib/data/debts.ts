import { createClient } from "@/lib/supabase/server"
import type { Debt, DebtPayment } from "@/lib/types"

interface DebtRow {
  id: string
  creditor_name: string
  total_amount: number
  due_date: string | null
  note: string | null
  status: "active" | "paid"
}

interface PaymentSumRow {
  debt_id: string
  amount: number
}

export async function getDebts(): Promise<Debt[]> {
  const supabase = await createClient()

  const [{ data: debts, error: debtsError }, { data: payments, error: paymentsError }] =
    await Promise.all([
      supabase
        .from("debts")
        .select("id, creditor_name, total_amount, due_date, note, status")
        .order("status")
        .order("due_date", { ascending: true, nullsFirst: false }),
      supabase.from("debt_payments").select("debt_id, amount"),
    ])

  if (debtsError) throw debtsError
  if (paymentsError) throw paymentsError

  const paidByDebt = new Map<string, number>()
  for (const p of (payments ?? []) as PaymentSumRow[]) {
    paidByDebt.set(p.debt_id, (paidByDebt.get(p.debt_id) ?? 0) + p.amount)
  }

  return ((debts ?? []) as DebtRow[]).map((d) => {
    const totalPaid = paidByDebt.get(d.id) ?? 0
    return {
      id: d.id,
      creditorName: d.creditor_name,
      totalAmount: d.total_amount,
      dueDate: d.due_date,
      note: d.note,
      status: d.status,
      totalPaid,
      remaining: d.total_amount - totalPaid,
    }
  })
}

export async function getDebtById(id: string): Promise<Debt | null> {
  const supabase = await createClient()

  const [{ data: debt, error: debtError }, { data: payments, error: paymentsError }] =
    await Promise.all([
      supabase
        .from("debts")
        .select("id, creditor_name, total_amount, due_date, note, status")
        .eq("id", id)
        .maybeSingle(),
      supabase.from("debt_payments").select("amount").eq("debt_id", id),
    ])

  if (debtError) throw debtError
  if (paymentsError) throw paymentsError
  if (!debt) return null

  const row = debt as DebtRow
  const totalPaid = (payments ?? []).reduce((sum, p) => sum + p.amount, 0)

  return {
    id: row.id,
    creditorName: row.creditor_name,
    totalAmount: row.total_amount,
    dueDate: row.due_date,
    note: row.note,
    status: row.status,
    totalPaid,
    remaining: row.total_amount - totalPaid,
  }
}

export async function getDebtPayments(debtId: string): Promise<DebtPayment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("debt_payments")
    .select("id, debt_id, amount, paid_on, note")
    .eq("debt_id", debtId)
    .order("paid_on", { ascending: false })

  if (error) throw error

  return (data ?? []).map((p) => ({
    id: p.id,
    debtId: p.debt_id,
    amount: p.amount,
    paidOn: p.paid_on,
    note: p.note,
  }))
}
