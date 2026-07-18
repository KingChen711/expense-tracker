import { createClient } from "@/lib/supabase/server"
import type { Category } from "@/lib/types"

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type, color")
    .order("type", { ascending: false })
    .order("name")

  if (error) throw error
  return data
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type, color")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data
}
