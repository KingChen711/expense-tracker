"use client"

import Link from "next/link"
import { Landmark } from "lucide-react"
import { useLocalData } from "@/components/local-data-provider"
import { buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { formatVND } from "@/lib/format"
import { cn } from "@/lib/utils"

export default function DebtsPage() {
  const { snapshot, loading } = useLocalData()
  const debts = snapshot.debts.map((debt) => {
    const totalPaid = snapshot.debt_payments.filter((payment) => payment.debt_id === debt.id).reduce((sum, payment) => sum + payment.amount, 0)
    return { ...debt, totalPaid, remaining: debt.total_amount - totalPaid }
  })
  const active = debts.filter((item) => item.status === "active")
  const paid = debts.filter((item) => item.status === "paid")
  const group = (title: string, items: typeof debts, muted = false) => items.length > 0 && <div className="space-y-2"><h2 className="text-sm font-medium text-muted-foreground">{title}</h2><ul className="divide-y rounded-xl border bg-card">{items.map((item) => <li key={item.id}><Link href={`/debts/${item.id}`} className={cn("flex items-center justify-between gap-4 p-3 hover:bg-muted", muted && "text-muted-foreground")}><div className="min-w-0"><p className="truncate font-medium">{item.creditor_name}</p><p className="truncate text-xs text-muted-foreground">{item.due_date ? `Hạn trả: ${item.due_date}` : "Không có hạn trả"}{item.note ? ` · ${item.note}` : ""}</p></div><div className="shrink-0 text-right"><p className={cn("font-tabular font-medium", item.remaining > 0 ? "text-destructive" : "text-primary")}>{item.remaining > 0 ? `Còn ${formatVND(item.remaining)}` : "Đã trả xong"}</p><p className="font-tabular text-xs text-muted-foreground">/ {formatVND(item.total_amount)}</p></div></Link></li>)}</ul></div>
  return <div className="space-y-6"><div className="flex items-center justify-between"><h1 className="text-xl font-semibold">Theo dõi nợ</h1><Link href="/debts/new" className={buttonVariants()}>+ Thêm khoản nợ</Link></div>{loading && <p className="text-sm text-muted-foreground">Đang mở dữ liệu trên máy…</p>}{!loading && debts.length === 0 && <EmptyState icon={Landmark} title="Chưa có khoản nợ" description="Thêm khoản đang nợ để theo dõi tiến độ trả." action={<Link href="/debts/new" className={buttonVariants()}>+ Thêm khoản nợ</Link>} />}{group("Đang nợ", active)}{group("Đã trả xong", paid, true)}</div>
}
