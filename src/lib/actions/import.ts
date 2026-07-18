"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { ExportData } from "@/lib/data/export"

function isExportData(value: unknown): value is ExportData {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return (
    Array.isArray(v.categories) &&
    Array.isArray(v.transactions) &&
    Array.isArray(v.budgets) &&
    Array.isArray(v.recurring_templates) &&
    Array.isArray(v.debts) &&
    Array.isArray(v.debt_payments)
  )
}

export async function importData(formData: FormData) {
  const file = formData.get("file") as File | null
  if (!file || file.size === 0) {
    redirect("/settings/export?error=" + encodeURIComponent("Vui lòng chọn file backup"))
  }

  let data: ExportData
  try {
    const text = await file.text()
    const parsed = JSON.parse(text)
    if (!isExportData(parsed)) {
      throw new Error("File không đúng định dạng backup")
    }
    data = parsed
  } catch {
    redirect(
      "/settings/export?error=" +
        encodeURIComponent("File backup không hợp lệ hoặc bị hỏng")
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const categoryIdMap = new Map<string, string>()
  const debtIdMap = new Map<string, string>()
  const importedCounts = {
    categories: 0,
    transactions: 0,
    budgets: 0,
    recurring: 0,
    debts: 0,
    payments: 0,
  }

  for (const c of data.categories) {
    const { data: inserted, error } = await supabase
      .from("categories")
      .insert({ user_id: user.id, name: c.name, type: c.type, color: c.color })
      .select("id")
      .single()
    if (!error && inserted) {
      categoryIdMap.set(c.id, inserted.id)
      importedCounts.categories++
    }
  }

  for (const d of data.debts) {
    const { data: inserted, error } = await supabase
      .from("debts")
      .insert({
        user_id: user.id,
        creditor_name: d.creditor_name,
        total_amount: d.total_amount,
        due_date: d.due_date,
        note: d.note,
        status: d.status,
      })
      .select("id")
      .single()
    if (!error && inserted) {
      debtIdMap.set(d.id, inserted.id)
      importedCounts.debts++
    }
  }

  if (data.transactions.length > 0) {
    const rows = data.transactions.map((t) => ({
      user_id: user.id,
      category_id: t.category_id ? (categoryIdMap.get(t.category_id) ?? null) : null,
      type: t.type,
      amount: t.amount,
      occurred_on: t.occurred_on,
      note: t.note,
    }))
    const { error, count } = await supabase
      .from("transactions")
      .insert(rows, { count: "exact" })
    if (!error) importedCounts.transactions += count ?? rows.length
  }

  for (const b of data.budgets) {
    const mappedCategoryId = categoryIdMap.get(b.category_id)
    if (!mappedCategoryId) continue
    const { error } = await supabase.from("budgets").insert({
      user_id: user.id,
      category_id: mappedCategoryId,
      month: b.month,
      limit_amount: b.limit_amount,
    })
    if (!error) importedCounts.budgets++
  }

  if (data.recurring_templates.length > 0) {
    const rows = data.recurring_templates.map((r) => ({
      user_id: user.id,
      category_id: r.category_id ? (categoryIdMap.get(r.category_id) ?? null) : null,
      type: r.type,
      amount: r.amount,
      note: r.note,
      day_of_month: r.day_of_month,
      start_date: r.start_date,
      last_generated_on: r.last_generated_on,
      active: r.active,
    }))
    const { error, count } = await supabase
      .from("recurring_templates")
      .insert(rows, { count: "exact" })
    if (!error) importedCounts.recurring += count ?? rows.length
  }

  const paymentRows = data.debt_payments
    .map((p) => {
      const mappedDebtId = debtIdMap.get(p.debt_id)
      if (!mappedDebtId) return null
      return {
        user_id: user.id,
        debt_id: mappedDebtId,
        amount: p.amount,
        paid_on: p.paid_on,
        note: p.note,
      }
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)

  if (paymentRows.length > 0) {
    const { error, count } = await supabase
      .from("debt_payments")
      .insert(paymentRows, { count: "exact" })
    if (!error) importedCounts.payments += count ?? paymentRows.length
  }

  revalidatePath("/dashboard")
  revalidatePath("/transactions")
  revalidatePath("/categories")
  revalidatePath("/budgets")
  revalidatePath("/recurring")
  revalidatePath("/debts")

  const summary = `${importedCounts.categories} danh mục, ${importedCounts.transactions} giao dịch, ${importedCounts.budgets} ngân sách, ${importedCounts.recurring} định kỳ, ${importedCounts.debts} khoản nợ, ${importedCounts.payments} lần trả`
  redirect("/settings/export?imported=" + encodeURIComponent(summary))
}
