export type TransactionType = "income" | "expense"

export interface Category {
  id: string
  name: string
  type: TransactionType
  color: string
}

export interface Transaction {
  id: string
  category_id: string | null
  type: TransactionType
  amount: number
  occurred_on: string
  note: string | null
  category: Category | null
}

export interface RecurringTemplate {
  id: string
  category_id: string | null
  type: TransactionType
  amount: number
  note: string | null
  day_of_month: number
  start_date: string
  last_generated_on: string | null
  active: boolean
  category: Category | null
}

export type DebtStatus = "active" | "paid"

export interface Debt {
  id: string
  creditorName: string
  totalAmount: number
  dueDate: string | null
  note: string | null
  status: DebtStatus
  totalPaid: number
  remaining: number
}

export interface DebtPayment {
  id: string
  debtId: string
  amount: number
  paidOn: string
  note: string | null
}
