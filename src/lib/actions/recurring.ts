"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { TransactionType } from "@/lib/types"

function parseRecurringForm(formData: FormData) {
  const type = formData.get("type") as TransactionType
  const amount = Number(formData.get("amount"))
  const categoryId = (formData.get("category_id") as string) || null
  const dayOfMonth = Number(formData.get("day_of_month"))
  const startDate = formData.get("start_date") as string
  const note = (formData.get("note") as string) || null
  const active = formData.get("active") === "on"

  if (!type || !["income", "expense"].includes(type)) {
    throw new Error("Loại giao dịch không hợp lệ")
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Số tiền phải lớn hơn 0")
  }
  if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
    throw new Error("Ngày trong tháng phải từ 1 đến 31")
  }
  if (!startDate) {
    throw new Error("Vui lòng chọn ngày bắt đầu")
  }

  return { type, amount, categoryId, dayOfMonth, startDate, note, active }
}

export async function createRecurringTemplate(formData: FormData) {
  const { type, amount, categoryId, dayOfMonth, startDate, note } =
    parseRecurringForm(formData)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase.from("recurring_templates").insert({
    user_id: user.id,
    type,
    amount,
    category_id: categoryId,
    day_of_month: dayOfMonth,
    start_date: startDate,
    note,
    active: true,
  })

  if (error) throw error

  revalidatePath("/recurring")
  redirect("/recurring")
}

export async function updateRecurringTemplate(id: string, formData: FormData) {
  const { type, amount, categoryId, dayOfMonth, startDate, note, active } =
    parseRecurringForm(formData)

  const supabase = await createClient()
  const { error } = await supabase
    .from("recurring_templates")
    .update({
      type,
      amount,
      category_id: categoryId,
      day_of_month: dayOfMonth,
      start_date: startDate,
      note,
      active,
    })
    .eq("id", id)

  if (error) throw error

  revalidatePath("/recurring")
  redirect("/recurring")
}

export async function deleteRecurringTemplate(formData: FormData) {
  const id = formData.get("id") as string
  const supabase = await createClient()
  const { error } = await supabase
    .from("recurring_templates")
    .delete()
    .eq("id", id)

  if (error) throw error

  revalidatePath("/recurring")
}
