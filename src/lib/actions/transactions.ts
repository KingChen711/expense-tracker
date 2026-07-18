"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { TransactionType } from "@/lib/types"

function parseTransactionForm(formData: FormData) {
  const type = formData.get("type") as TransactionType
  const amount = Number(formData.get("amount"))
  const categoryId = (formData.get("category_id") as string) || null
  const occurredOn = formData.get("occurred_on") as string
  const note = (formData.get("note") as string) || null

  if (!type || !["income", "expense"].includes(type)) {
    throw new Error("Loại giao dịch không hợp lệ")
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Số tiền phải lớn hơn 0")
  }
  if (!occurredOn) {
    throw new Error("Vui lòng chọn ngày")
  }

  return { type, amount, categoryId, occurredOn, note }
}

export async function createTransaction(formData: FormData) {
  const { type, amount, categoryId, occurredOn, note } =
    parseTransactionForm(formData)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    type,
    amount,
    category_id: categoryId,
    occurred_on: occurredOn,
    note,
  })

  if (error) throw error

  revalidatePath("/transactions")
  redirect("/transactions")
}

export async function updateTransaction(id: string, formData: FormData) {
  const { type, amount, categoryId, occurredOn, note } =
    parseTransactionForm(formData)

  const supabase = await createClient()
  const { error } = await supabase
    .from("transactions")
    .update({
      type,
      amount,
      category_id: categoryId,
      occurred_on: occurredOn,
      note,
    })
    .eq("id", id)

  if (error) throw error

  revalidatePath("/transactions")
  redirect("/transactions")
}

export async function deleteTransaction(formData: FormData) {
  const id = formData.get("id") as string
  const supabase = await createClient()
  const { error } = await supabase.from("transactions").delete().eq("id", id)

  if (error) throw error

  revalidatePath("/transactions")
}
