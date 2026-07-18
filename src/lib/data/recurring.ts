import { createClient } from "@/lib/supabase/server"
import type { RecurringTemplate } from "@/lib/types"

export async function getRecurringTemplates(): Promise<RecurringTemplate[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("recurring_templates")
    .select(
      "id, category_id, type, amount, note, day_of_month, start_date, last_generated_on, active, category:categories(id, name, type, color)"
    )
    .order("active", { ascending: false })
    .order("day_of_month")

  if (error) throw error
  return (data ?? []) as unknown as RecurringTemplate[]
}

export async function getRecurringTemplateById(
  id: string
): Promise<RecurringTemplate | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("recurring_templates")
    .select(
      "id, category_id, type, amount, note, day_of_month, start_date, last_generated_on, active, category:categories(id, name, type, color)"
    )
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data as unknown as RecurringTemplate | null
}
