import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getDashboardSummary } from "@/lib/data/dashboard"
import { getCategoryBreakdown, getMonthlyTrend } from "@/lib/data/stats"
import { generateDueRecurringTransactions } from "@/lib/recurring/generate"
import { DashboardFilters } from "@/components/dashboard/dashboard-filters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { formatVND } from "@/lib/format"
import { cn } from "@/lib/utils"
import { CategoryPieChart } from "@/components/charts/category-pie-chart"
import { MonthlyTrendChart } from "@/components/charts/monthly-trend-chart"

function toISO(d: Date) {
  return d.toISOString().slice(0, 10)
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

function parseDate(value: string | undefined, fallback: Date) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  // Catch up any due recurring transactions before computing today's numbers.
  await generateDueRecurringTransactions()

  const params = await searchParams
  const today = new Date()

  const from = parseDate(params.from, startOfMonth(today))
  const to = parseDate(params.to, endOfMonth(from))
  const range = { from: toISO(from), to: toISO(to) }
  const hasFilters = Boolean(params.from || params.to)

  const anchor = to
  const isFullMonth =
    toISO(from) === toISO(startOfMonth(anchor)) &&
    toISO(to) === toISO(endOfMonth(anchor))
  const isCurrentMonth =
    isFullMonth && toISO(startOfMonth(anchor)) === toISO(startOfMonth(today))

  const rangeLabel = isFullMonth
    ? `tháng ${anchor.getMonth() + 1}/${anchor.getFullYear()}`
    : `${range.from} → ${range.to}`

  const prevMonth = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1)
  const nextMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1)
  const prevHref = `/dashboard?from=${toISO(startOfMonth(prevMonth))}&to=${toISO(endOfMonth(prevMonth))}`
  const nextHref = `/dashboard?from=${toISO(startOfMonth(nextMonth))}&to=${toISO(endOfMonth(nextMonth))}`

  const [{ balance, monthIncome, monthExpense }, categoryBreakdown, monthlyTrend] =
    await Promise.all([
      getDashboardSummary(range),
      getCategoryBreakdown(range),
      getMonthlyTrend(6, anchor),
    ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tổng quan</h1>
        <Link href="/transactions/new" className={buttonVariants()}>
          + Thêm giao dịch
        </Link>
      </div>

      <DashboardFilters
        defaultValues={{ from: params.from, to: params.to }}
        hasFilters={hasFilters}
      />

      <div className="flex items-center gap-2">
        <Link
          href={prevHref}
          className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
          aria-label="Tháng trước"
        >
          <ChevronLeft className="size-4" />
        </Link>
        <span className="min-w-40 text-center text-sm font-medium capitalize">
          {rangeLabel}
        </span>
        <Link
          href={nextHref}
          className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
          aria-label="Tháng sau"
        >
          <ChevronRight className="size-4" />
        </Link>
        {!isCurrentMonth && (
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Về tháng này
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Số dư hiện tại
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={
                balance < 0
                  ? "font-tabular text-2xl font-semibold text-destructive"
                  : "font-tabular text-2xl font-semibold"
              }
            >
              {formatVND(balance)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground capitalize">
              Thu nhập {rangeLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-tabular text-2xl font-semibold text-primary">
              {formatVND(monthIncome)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground capitalize">
              Chi tiêu {rangeLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-tabular text-2xl font-semibold text-destructive">
              {formatVND(monthExpense)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="capitalize">
              Chi tiêu theo danh mục ({rangeLabel})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={categoryBreakdown} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thu chi 6 tháng gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart data={monthlyTrend} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
