"use client"

import {
  deleteLocalRecord,
  getLocalRecord,
  getLocalSnapshot,
  putLocalRecord,
} from "@/lib/local/db"
import type {
  BudgetRecord,
  CategoryRecord,
  DebtPaymentRecord,
  DebtRecord,
  LocalSnapshot,
  RecurringRecord,
  TransactionRecord,
} from "@/lib/local/types"
import type { TransactionType } from "@/lib/types"

function nowISO() {
  return new Date().toISOString()
}

function newId() {
  return crypto.randomUUID()
}

export async function saveCategory(input: {
  id?: string
  name: string
  type: TransactionType
  color: string
}) {
  const existing = input.id
    ? await getLocalRecord<CategoryRecord>("categories", input.id)
    : undefined
  await putLocalRecord("categories", {
    ...existing,
    id: input.id ?? newId(),
    name: input.name.trim(),
    type: input.type,
    color: input.color,
    created_at: existing?.created_at ?? nowISO(),
  } satisfies CategoryRecord)
}

export async function removeCategory(id: string) {
  const snapshot = await getLocalSnapshot()
  await Promise.all([
    deleteLocalRecord("categories", id),
    ...snapshot.transactions
      .filter((item) => item.category_id === id)
      .map((item) => putLocalRecord("transactions", { ...item, category_id: null })),
    ...snapshot.recurring_templates
      .filter((item) => item.category_id === id)
      .map((item) => putLocalRecord("recurring_templates", { ...item, category_id: null })),
    ...snapshot.budgets
      .filter((item) => item.category_id === id)
      .map((item) => deleteLocalRecord("budgets", item.id, false)),
  ])
}

export async function saveTransaction(input: {
  id?: string
  category_id: string | null
  type: TransactionType
  amount: number
  occurred_on: string
  note: string | null
}) {
  const existing = input.id
    ? await getLocalRecord<TransactionRecord>("transactions", input.id)
    : undefined
  await putLocalRecord("transactions", {
    ...existing,
    ...input,
    id: input.id ?? newId(),
    created_at: existing?.created_at ?? nowISO(),
  } satisfies TransactionRecord)
}

export async function removeTransaction(id: string) {
  await deleteLocalRecord("transactions", id)
}

export function currentMonthStart() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`
}

export async function saveBudget(input: {
  id?: string
  category_id: string
  limit_amount: number
}) {
  const existing = input.id
    ? await getLocalRecord<BudgetRecord>("budgets", input.id)
    : undefined
  await putLocalRecord("budgets", {
    ...existing,
    id: input.id ?? newId(),
    category_id: input.category_id,
    limit_amount: input.limit_amount,
    month: existing?.month ?? currentMonthStart(),
    created_at: existing?.created_at ?? nowISO(),
  } satisfies BudgetRecord)
}

export async function removeBudget(id: string) {
  await deleteLocalRecord("budgets", id)
}

export async function saveRecurring(input: {
  id?: string
  category_id: string | null
  type: TransactionType
  amount: number
  note: string | null
  day_of_month: number
  start_date: string
  active: boolean
}) {
  const existing = input.id
    ? await getLocalRecord<RecurringRecord>("recurring_templates", input.id)
    : undefined
  await putLocalRecord("recurring_templates", {
    ...existing,
    ...input,
    id: input.id ?? newId(),
    last_generated_on: existing?.last_generated_on ?? null,
    created_at: existing?.created_at ?? nowISO(),
  } satisfies RecurringRecord)
}

export async function removeRecurring(id: string) {
  await deleteLocalRecord("recurring_templates", id)
}

export async function saveDebt(input: {
  id?: string
  creditor_name: string
  total_amount: number
  due_date: string | null
  note: string | null
  status?: "active" | "paid"
}) {
  const existing = input.id
    ? await getLocalRecord<DebtRecord>("debts", input.id)
    : undefined
  await putLocalRecord("debts", {
    ...existing,
    ...input,
    id: input.id ?? newId(),
    status: input.status ?? existing?.status ?? "active",
    created_at: existing?.created_at ?? nowISO(),
  } satisfies DebtRecord)
}

export async function removeDebt(id: string) {
  const snapshot = await getLocalSnapshot()
  await Promise.all([
    deleteLocalRecord("debts", id),
    ...snapshot.debt_payments
      .filter((payment) => payment.debt_id === id)
      .map((payment) => deleteLocalRecord("debt_payments", payment.id, false)),
  ])
}

export async function addDebtPayment(input: {
  debt_id: string
  amount: number
  paid_on: string
  note: string | null
}) {
  await putLocalRecord("debt_payments", {
    id: newId(),
    ...input,
    created_at: nowISO(),
  } satisfies DebtPaymentRecord)

  const [debt, snapshot] = await Promise.all([
    getLocalRecord<DebtRecord>("debts", input.debt_id),
    getLocalSnapshot(),
  ])
  if (!debt) return
  const totalPaid = snapshot.debt_payments
    .filter((payment) => payment.debt_id === input.debt_id)
    .reduce((sum, payment) => sum + payment.amount, 0)
  if (totalPaid >= debt.total_amount && debt.status !== "paid") {
    await putLocalRecord("debts", { ...debt, status: "paid" })
  }
}

export async function removeDebtPayment(id: string, debtId: string) {
  await deleteLocalRecord("debt_payments", id)
  const [debt, snapshot] = await Promise.all([
    getLocalRecord<DebtRecord>("debts", debtId),
    getLocalSnapshot(),
  ])
  if (!debt) return
  const totalPaid = snapshot.debt_payments
    .filter((payment) => payment.debt_id === debtId && payment.id !== id)
    .reduce((sum, payment) => sum + payment.amount, 0)
  if (totalPaid < debt.total_amount && debt.status !== "active") {
    await putLocalRecord("debts", { ...debt, status: "active" })
  }
}

async function deterministicUuid(value: string) {
  const bytes = new TextEncoder().encode(value)
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))
  hash[6] = (hash[6] & 0x0f) | 0x50
  hash[8] = (hash[8] & 0x3f) | 0x80
  const hex = Array.from(hash.slice(0, 16), (byte) => byte.toString(16).padStart(2, "0")).join("")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function localDateISO(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export async function generateDueRecurringLocal(): Promise<number> {
  const snapshot = await getLocalSnapshot()
  const existingIds = new Set(snapshot.transactions.map((item) => item.id))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let generated = 0

  for (const template of snapshot.recurring_templates.filter((item) => item.active)) {
    const start = new Date(`${template.start_date}T00:00:00`)
    const last = template.last_generated_on
      ? new Date(`${template.last_generated_on}T00:00:00`)
      : null
    let year = last ? last.getFullYear() : start.getFullYear()
    let month = last ? last.getMonth() + 1 : start.getMonth()
    let lastGenerated: string | null = null

    for (let index = 0; index < 24; index += 1) {
      if (month > 11) {
        month = 0
        year += 1
      }
      const occurrence = new Date(year, month, Math.min(template.day_of_month, daysInMonth(year, month)))
      if (occurrence > today) break
      if (occurrence >= start) {
        const occurredOn = localDateISO(occurrence)
        const id = await deterministicUuid(`recurring:${template.id}:${occurredOn}`)
        if (!existingIds.has(id)) {
          await putLocalRecord("transactions", {
            id,
            category_id: template.category_id,
            type: template.type,
            amount: template.amount,
            occurred_on: occurredOn,
            note: template.note,
            created_at: nowISO(),
          } satisfies TransactionRecord)
          existingIds.add(id)
          generated += 1
        }
        lastGenerated = occurredOn
      }
      month += 1
    }

    if (lastGenerated && lastGenerated !== template.last_generated_on) {
      await putLocalRecord("recurring_templates", {
        ...template,
        last_generated_on: lastGenerated,
      })
    }
  }

  return generated
}

export async function importLocalSnapshot(snapshot: LocalSnapshot) {
  for (const [table, records] of Object.entries(snapshot) as [keyof LocalSnapshot, LocalSnapshot[keyof LocalSnapshot]][]) {
    for (const record of records) await putLocalRecord(table, record)
  }
}
