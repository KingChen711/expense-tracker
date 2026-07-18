"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { currentMonthStart } from "@/lib/data/budgets"

export async function createBudget(formData: FormData) {
  const categoryId = formData.get("category_id") as string
  const limitAmount = Number(formData.get("limit_amount"))

  if (!categoryId) {
    throw new Error("Vui lòng chọn danh mục")
  }
  if (!Number.isFinite(limitAmount) || limitAmount <= 0) {
    throw new Error("Hạn mức phải lớn hơn 0")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase.from("budgets").insert({
    user_id: user.id,
    category_id: categoryId,
    limit_amount: limitAmount,
    month: currentMonthStart(),
  })

  if (error) throw error

  revalidatePath("/budgets")
  redirect("/budgets")
}

export async function updateBudget(id: string, formData: FormData) {
  const limitAmount = Number(formData.get("limit_amount"))
  if (!Number.isFinite(limitAmount) || limitAmount <= 0) {
    throw new Error("Hạn mức phải lớn hơn 0")
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("budgets")
    .update({ limit_amount: limitAmount })
    .eq("id", id)

  if (error) throw error

  revalidatePath("/budgets")
  redirect("/budgets")
}

export async function deleteBudget(formData: FormData) {
  const id = formData.get("id") as string
  const supabase = await createClient()
  const { error } = await supabase.from("budgets").delete().eq("id", id)

  if (error) throw error

  revalidatePath("/budgets")
}
