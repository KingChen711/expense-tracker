import { createClient } from "@/lib/supabase/server"

const MAX_OCCURRENCES_PER_RUN = 24

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function occurrenceDate(year: number, month: number, dayOfMonth: number) {
  const day = Math.min(dayOfMonth, daysInMonth(year, month))
  return new Date(year, month, day)
}

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10)
}

interface TemplateRow {
  id: string
  user_id: string
  category_id: string | null
  type: "income" | "expense"
  amount: number
  note: string | null
  day_of_month: number
  start_date: string
  last_generated_on: string | null
}

// Runs on dashboard load: catches up any recurring transactions that are due
// but haven't been generated yet. No server cron needed since the user opens
// the app daily (see PLAN.md).
export async function generateDueRecurringTransactions(): Promise<number> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 0

  const { data: templates, error } = await supabase
    .from("recurring_templates")
    .select(
      "id, user_id, category_id, type, amount, note, day_of_month, start_date, last_generated_on"
    )
    .eq("active", true)

  if (error) throw error
  if (!templates || templates.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let totalGenerated = 0

  for (const template of templates as TemplateRow[]) {
    const startDate = new Date(template.start_date)
    let candidateYear: number
    let candidateMonth: number

    if (template.last_generated_on) {
      const last = new Date(template.last_generated_on)
      candidateYear = last.getFullYear()
      candidateMonth = last.getMonth() + 1
    } else {
      candidateYear = startDate.getFullYear()
      candidateMonth = startDate.getMonth()
    }

    const newTransactions: {
      user_id: string
      category_id: string | null
      type: string
      amount: number
      occurred_on: string
      note: string | null
    }[] = []

    let lastOccurrence: Date | null = null
    let iterations = 0

    while (iterations < MAX_OCCURRENCES_PER_RUN) {
      if (candidateMonth > 11) {
        candidateMonth = 0
        candidateYear += 1
      }

      const occurrence = occurrenceDate(
        candidateYear,
        candidateMonth,
        template.day_of_month
      )

      if (occurrence > today) break

      if (occurrence >= startDate) {
        newTransactions.push({
          user_id: template.user_id,
          category_id: template.category_id,
          type: template.type,
          amount: template.amount,
          occurred_on: toISODate(occurrence),
          note: template.note,
        })
        lastOccurrence = occurrence
      }

      candidateMonth += 1
      iterations += 1
    }

    if (newTransactions.length > 0 && lastOccurrence) {
      const { error: insertError } = await supabase
        .from("transactions")
        .insert(newTransactions)
      if (insertError) throw insertError

      const { error: updateError } = await supabase
        .from("recurring_templates")
        .update({ last_generated_on: toISODate(lastOccurrence) })
        .eq("id", template.id)
      if (updateError) throw updateError

      totalGenerated += newTransactions.length
    }
  }

  return totalGenerated
}
