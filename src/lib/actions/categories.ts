"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { TransactionType } from "@/lib/types"

function parseCategoryForm(formData: FormData) {
  const name = (formData.get("name") as string)?.trim()
  const type = formData.get("type") as TransactionType
  const color = (formData.get("color") as string) || "#6b7280"

  if (!name) {
    throw new Error("Vui lòng nhập tên danh mục")
  }
  if (!type || !["income", "expense"].includes(type)) {
    throw new Error("Loại danh mục không hợp lệ")
  }

  return { name, type, color }
}

export async function createCategory(formData: FormData) {
  const { name, type, color } = parseCategoryForm(formData)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase
    .from("categories")
    .insert({ user_id: user.id, name, type, color })

  if (error) throw error

  revalidatePath("/categories")
  redirect("/categories")
}

export async function updateCategory(id: string, formData: FormData) {
  const { name, type, color } = parseCategoryForm(formData)

  const supabase = await createClient()
  const { error } = await supabase
    .from("categories")
    .update({ name, type, color })
    .eq("id", id)

  if (error) throw error

  revalidatePath("/categories")
  redirect("/categories")
}

export async function deleteCategory(formData: FormData) {
  const id = formData.get("id") as string
  const supabase = await createClient()
  const { error } = await supabase.from("categories").delete().eq("id", id)

  if (error) throw error

  revalidatePath("/categories")
}
