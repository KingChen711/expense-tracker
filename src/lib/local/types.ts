import type { DebtStatus, TransactionType } from "@/lib/types"

export interface CategoryRecord {
  id: string
  user_id?: string
  name: string
  type: TransactionType
  color: string
  created_at?: string
}

export interface TransactionRecord {
  id: string
  user_id?: string
  category_id: string | null
  type: TransactionType
  amount: number
  occurred_on: string
  note: string | null
  created_at?: string
}

export interface BudgetRecord {
  id: string
  user_id?: string
  category_id: string
  month: string
  limit_amount: number
  created_at?: string
}

export interface RecurringRecord {
  id: string
  user_id?: string
  category_id: string | null
  type: TransactionType
  amount: number
  note: string | null
  day_of_month: number
  start_date: string
  last_generated_on: string | null
  active: boolean
  created_at?: string
}

export interface DebtRecord {
  id: string
  user_id?: string
  creditor_name: string
  total_amount: number
  due_date: string | null
  note: string | null
  status: DebtStatus
  created_at?: string
}

export interface DebtPaymentRecord {
  id: string
  user_id?: string
  debt_id: string
  amount: number
  paid_on: string
  note: string | null
  created_at?: string
}

export interface LocalSnapshot {
  categories: CategoryRecord[]
  transactions: TransactionRecord[]
  budgets: BudgetRecord[]
  recurring_templates: RecurringRecord[]
  debts: DebtRecord[]
  debt_payments: DebtPaymentRecord[]
}

export type DataTable = keyof LocalSnapshot

export type LocalRecord =
  | CategoryRecord
  | TransactionRecord
  | BudgetRecord
  | RecurringRecord
  | DebtRecord
  | DebtPaymentRecord

export interface OutboxEntry {
  mutationId: string
  table: DataTable
  entityId: string
  operation: "upsert" | "delete"
  payload: LocalRecord | null
  queuedAt: number
}

export const EMPTY_SNAPSHOT: LocalSnapshot = {
  categories: [],
  transactions: [],
  budgets: [],
  recurring_templates: [],
  debts: [],
  debt_payments: [],
}

export const DATA_TABLES: DataTable[] = [
  "categories",
  "transactions",
  "budgets",
  "recurring_templates",
  "debts",
  "debt_payments",
]
