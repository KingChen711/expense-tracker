"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"

function parseDebtForm(formData: FormData) {
  const creditorName = (formData.get("creditor_name") as string)?.trim()
  const totalAmount = Number(formData.get("total_amount"))
  const dueDate = (formData.get("due_date") as string) || null
  const note = (formData.get("note") as string) || null

  if (!creditorName) {
    throw new Error("Vui lòng nhập tên chủ nợ")
  }
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw new Error("Tổng tiền phải lớn hơn 0")
  }

  return { creditorName, totalAmount, dueDate, note }
}

async function syncDebtStatus(supabase: SupabaseClient, debtId: string) {
  const [{ data: debt, error: debtError }, { data: payments, error: paymentsError }] =
    await Promise.all([
      supabase.from("debts").select("total_amount").eq("id", debtId).maybeSingle(),
      supabase.from("debt_payments").select("amount").eq("debt_id", debtId),
    ])

  if (debtError) throw debtError
  if (paymentsError) throw paymentsError
  if (!debt) return

  const totalPaid = (payments ?? []).reduce(
    (sum: number, p: { amount: number }) => sum + p.amount,
    0
  )
  const status = totalPaid >= debt.total_amount ? "paid" : "active"

  const { error } = await supabase
    .from("debts")
    .update({ status })
    .eq("id", debtId)

  if (error) throw error
}

export async function createDebt(formData: FormData) {
  const { creditorName, totalAmount, dueDate, note } = parseDebtForm(formData)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase.from("debts").insert({
    user_id: user.id,
    creditor_name: creditorName,
    total_amount: totalAmount,
    due_date: dueDate,
    note,
  })

  if (error) throw error

  revalidatePath("/debts")
  redirect("/debts")
}

export async function updateDebt(id: string, formData: FormData) {
  const { creditorName, totalAmount, dueDate, note } = parseDebtForm(formData)

  const supabase = await createClient()
  const { error } = await supabase
    .from("debts")
    .update({
      creditor_name: creditorName,
      total_amount: totalAmount,
      due_date: dueDate,
      note,
    })
    .eq("id", id)

  if (error) throw error

  await syncDebtStatus(supabase, id)

  revalidatePath("/debts")
  revalidatePath(`/debts/${id}`)
  redirect("/debts")
}

export async function deleteDebt(formData: FormData) {
  const id = formData.get("id") as string
  const supabase = await createClient()
  const { error } = await supabase.from("debts").delete().eq("id", id)

  if (error) throw error

  revalidatePath("/debts")
}

export async function addDebtPayment(debtId: string, formData: FormData) {
  const amount = Number(formData.get("amount"))
  const paidOn = formData.get("paid_on") as string
  const note = (formData.get("note") as string) || null

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Số tiền trả phải lớn hơn 0")
  }
  if (!paidOn) {
    throw new Error("Vui lòng chọn ngày trả")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase.from("debt_payments").insert({
    user_id: user.id,
    debt_id: debtId,
    amount,
    paid_on: paidOn,
    note,
  })

  if (error) throw error

  await syncDebtStatus(supabase, debtId)

  revalidatePath("/debts")
  revalidatePath(`/debts/${debtId}`)
}

export async function deleteDebtPayment(formData: FormData) {
  const id = formData.get("id") as string
  const debtId = formData.get("debt_id") as string

  const supabase = await createClient()
  const { error } = await supabase.from("debt_payments").delete().eq("id", id)

  if (error) throw error

  await syncDebtStatus(supabase, debtId)

  revalidatePath("/debts")
  revalidatePath(`/debts/${debtId}`)
}
