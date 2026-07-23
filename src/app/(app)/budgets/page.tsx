"use client"

import Link from "next/link"
import { WalletCards } from "lucide-react"
import { useLocalData } from "@/components/local-data-provider"
import { Button, buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { currentMonthStart, removeBudget } from "@/lib/local/repository"
import { formatVND } from "@/lib/format"
import { cn } from "@/lib/utils"

export default function BudgetsPage() {
  const { snapshot, loading } = useLocalData()
  const month = currentMonthStart()
  const monthPrefix = month.slice(0, 7)
  const budgets = snapshot.budgets.filter((item) => item.month === month).map((budget) => ({
    ...budget,
    category: snapshot.categories.find((category) => category.id === budget.category_id),
    spent: snapshot.transactions.filter((item) => item.type === "expense" && item.category_id === budget.category_id && item.occurred_on.startsWith(monthPrefix)).reduce((sum, item) => sum + item.amount, 0),
  }))

  return <div className="space-y-4"><div className="flex items-center justify-between"><div><h1 className="text-xl font-semibold">Ngân sách</h1><p className="text-sm text-muted-foreground">Theo tháng hiện tại</p></div><Link href="/budgets/new" className={buttonVariants()}>+ Thêm ngân sách</Link></div>
    {loading && <p className="text-sm text-muted-foreground">Đang mở dữ liệu trên máy…</p>}
    {!loading && budgets.length === 0 && <EmptyState icon={WalletCards} title="Đặt ngân sách đầu tiên" description="Đặt hạn mức để biết khi nào cần chậm lại." action={<Link href="/budgets/new" className={buttonVariants()}>+ Thêm ngân sách</Link>} />}
    <ul className="space-y-3">{budgets.map((budget) => { const rawPercent = budget.limit_amount > 0 ? Math.round((budget.spent / budget.limit_amount) * 100) : 0; const percent = Math.min(100, rawPercent); const over = budget.spent > budget.limit_amount; const near = !over && percent >= 80; return <li key={budget.id} className="rounded-xl border-l-4 border-y border-r bg-card p-4" style={{ borderLeftColor: budget.category?.color ?? "#6b7280" }}><div className="flex items-center justify-between gap-4"><span className="font-medium">{budget.category?.name ?? "Danh mục"}</span><div className="flex gap-2"><Link href={`/budgets/${budget.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Sửa</Link><Button variant="destructive" size="sm" onClick={() => void removeBudget(budget.id)}>Xóa</Button></div></div><div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", over ? "bg-destructive" : near ? "bg-warning" : "bg-primary")} style={{ width: `${percent}%` }} /></div><p className={cn("font-tabular mt-1 text-sm", over ? "font-medium text-destructive" : near ? "font-medium text-warning" : "text-muted-foreground")}>{formatVND(budget.spent)} / {formatVND(budget.limit_amount)}{over && " · Vượt ngân sách"}{near && " · Sắp chạm hạn mức"}</p></li> })}</ul>
  </div>
}
