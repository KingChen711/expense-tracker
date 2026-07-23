"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight, WalletCards } from "lucide-react"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { CategoryPieChart } from "@/components/charts/category-pie-chart"
import { MonthlyTrendChart } from "@/components/charts/monthly-trend-chart"
import { useLocalData } from "@/components/local-data-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { currentMonthStart } from "@/lib/local/repository"
import { formatVND } from "@/lib/format"
import { cn } from "@/lib/utils"

function toISO(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function startOfMonth(date: Date) { return new Date(date.getFullYear(), date.getMonth(), 1) }
function endOfMonth(date: Date) { return new Date(date.getFullYear(), date.getMonth() + 1, 0) }
function parseDate(value: string | null, fallback: Date) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const { snapshot, loading } = useLocalData()
  const today = new Date()
  const fromParam = searchParams.get("from")
  const toParam = searchParams.get("to")
  const from = parseDate(fromParam, startOfMonth(today))
  const to = parseDate(toParam, endOfMonth(from))
  const range = { from: toISO(from), to: toISO(to) }
  const anchor = to
  const isFullMonth = range.from === toISO(startOfMonth(anchor)) && range.to === toISO(endOfMonth(anchor))
  const isCurrentMonth = isFullMonth && toISO(startOfMonth(anchor)) === toISO(startOfMonth(today))
  const rangeLabel = isFullMonth ? `tháng ${anchor.getMonth() + 1}/${anchor.getFullYear()}` : `${range.from} → ${range.to}`
  const previousAnchor = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1)
  const nextAnchor = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1)
  const monthHref = (date: Date) => `/dashboard?from=${toISO(startOfMonth(date))}&to=${toISO(endOfMonth(date))}`

  const rangeRows = snapshot.transactions.filter((item) => item.occurred_on >= range.from && item.occurred_on <= range.to)
  const balance = snapshot.transactions.reduce((sum, item) => sum + (item.type === "income" ? item.amount : -item.amount), 0)
  const monthIncome = rangeRows.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0)
  const monthExpense = rangeRows.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0)
  const amountLeft = monthIncome - monthExpense
  const categoryMap = new Map(snapshot.categories.map((category) => [category.id, category]))
  const breakdownMap = new Map<string, { categoryId: string | null; name: string; color: string; total: number }>()
  for (const item of rangeRows.filter((row) => row.type === "expense")) {
    const key = item.category_id ?? "none"
    const category = item.category_id ? categoryMap.get(item.category_id) : null
    const current = breakdownMap.get(key)
    if (current) current.total += item.amount
    else breakdownMap.set(key, { categoryId: item.category_id, name: category?.name ?? "Không danh mục", color: category?.color ?? "#6b7280", total: item.amount })
  }
  const categoryBreakdown = Array.from(breakdownMap.values()).sort((a, b) => b.total - a.total)

  const monthlyTrend = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(anchor.getFullYear(), anchor.getMonth() - (5 - index), 1)
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const rows = snapshot.transactions.filter((item) => item.occurred_on.startsWith(month))
    return {
      month,
      label: `T${date.getMonth() + 1}/${date.getFullYear()}`,
      income: rows.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0),
      expense: rows.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0),
    }
  })
  const previousExpense = monthlyTrend.at(-2)?.expense ?? 0
  const expenseChange = monthExpense - previousExpense
  const monthKey = currentMonthStart()
  const currentMonthPrefix = monthKey.slice(0, 7)
  const currentExpenses = snapshot.transactions.filter((item) => item.type === "expense" && item.occurred_on.startsWith(currentMonthPrefix))
  const watchedBudgets = snapshot.budgets
    .filter((budget) => budget.month === monthKey)
    .map((budget) => ({
      ...budget,
      category: categoryMap.get(budget.category_id),
      spent: currentExpenses.filter((item) => item.category_id === budget.category_id).reduce((sum, item) => sum + item.amount, 0),
    }))
    .filter((budget) => budget.spent / budget.limit_amount >= 0.8)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="text-xl font-semibold">Tổng quan</h1><p className="mt-0.5 text-sm text-muted-foreground">Tính trực tiếp từ dữ liệu trên thiết bị.</p></div>
        <Link href="/transactions/new" className={buttonVariants()}><span className="hidden sm:inline">+ Thêm giao dịch</span><span className="sm:hidden">+ Thêm</span></Link>
      </div>
      <DashboardFilters defaultValues={{ from: fromParam ?? undefined, to: toParam ?? undefined }} hasFilters={Boolean(fromParam || toParam)} />
      <div className="flex items-center gap-2">
        <Link href={monthHref(previousAnchor)} className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))} aria-label="Tháng trước"><ChevronLeft className="size-4" /></Link>
        <span className="min-w-40 text-center text-sm font-medium capitalize">{rangeLabel}</span>
        <Link href={monthHref(nextAnchor)} className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))} aria-label="Tháng sau"><ChevronRight className="size-4" /></Link>
        {!isCurrentMonth && <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>Về tháng này</Link>}
      </div>
      {loading && <p className="text-sm text-muted-foreground">Đang mở dữ liệu trên máy…</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="sm:col-span-2 lg:col-span-1"><CardHeader><CardTitle className="text-sm text-muted-foreground">Còn lại trong kỳ</CardTitle></CardHeader><CardContent><p className={cn("font-tabular text-2xl font-semibold", amountLeft < 0 && "text-destructive")}>{formatVND(amountLeft)}</p><p className="mt-1 text-xs text-muted-foreground">Thu nhập trừ chi tiêu {rangeLabel}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Thu nhập</CardTitle></CardHeader><CardContent><p className="font-tabular text-2xl font-semibold text-primary">{formatVND(monthIncome)}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Chi tiêu</CardTitle></CardHeader><CardContent><p className="font-tabular text-2xl font-semibold text-destructive">{formatVND(monthExpense)}</p><p className={cn("mt-1 flex items-center gap-1 text-xs", expenseChange > 0 ? "text-destructive" : "text-primary")}>{expenseChange > 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{expenseChange === 0 ? "Không đổi so với tháng trước" : `${formatVND(Math.abs(expenseChange))} so với tháng trước`}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Số dư tổng</CardTitle></CardHeader><CardContent><p className={cn("font-tabular text-2xl font-semibold", balance < 0 && "text-destructive")}>{formatVND(balance)}</p><p className="mt-1 text-xs text-muted-foreground">Tất cả giao dịch</p></CardContent></Card>
      </div>
      {isCurrentMonth && watchedBudgets.length > 0 && <Card className="border-warning/40 bg-warning/5"><CardHeader className="flex items-center gap-2"><WalletCards className="size-4 text-warning" /><CardTitle>Cần chú ý ngân sách</CardTitle></CardHeader><CardContent className="space-y-2">{watchedBudgets.slice(0, 3).map((budget) => { const over = budget.spent > budget.limit_amount; return <div key={budget.id} className="flex justify-between gap-4 text-sm"><span className="truncate font-medium">{budget.category?.name ?? "Danh mục"}</span><span className={cn("shrink-0 font-tabular text-xs", over ? "text-destructive" : "text-warning")}>{over ? `Vượt ${formatVND(budget.spent - budget.limit_amount)}` : `Đã dùng ${Math.round((budget.spent / budget.limit_amount) * 100)}%`}</span></div> })}</CardContent></Card>}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Chi tiêu theo danh mục ({rangeLabel})</CardTitle></CardHeader><CardContent><CategoryPieChart data={categoryBreakdown} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Thu chi 6 tháng gần đây</CardTitle></CardHeader><CardContent><MonthlyTrendChart data={monthlyTrend} /></CardContent></Card>
      </div>
    </div>
  )
}
