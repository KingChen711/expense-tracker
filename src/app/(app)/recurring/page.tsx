"use client"

import Link from "next/link"
import { Repeat } from "lucide-react"
import { useLocalData } from "@/components/local-data-provider"
import { Button, buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { removeRecurring } from "@/lib/local/repository"
import { formatVND } from "@/lib/format"
import { cn } from "@/lib/utils"

export default function RecurringPage() {
  const { snapshot, loading } = useLocalData()
  const templates = snapshot.recurring_templates.map((item) => ({ ...item, category: snapshot.categories.find((category) => category.id === item.category_id) ?? null }))
  return <div className="space-y-4"><div className="flex items-center justify-between"><h1 className="text-xl font-semibold">Giao dịch định kỳ</h1><Link href="/recurring/new" className={buttonVariants()}>+ Thêm định kỳ</Link></div>
    {loading && <p className="text-sm text-muted-foreground">Đang mở dữ liệu trên máy…</p>}
    {!loading && templates.length === 0 && <EmptyState icon={Repeat} title="Chưa có giao dịch định kỳ" description="Thêm tiền thuê nhà, hóa đơn hoặc lương để app tự ghi nhận mỗi tháng." action={<Link href="/recurring/new" className={buttonVariants()}>+ Thêm định kỳ</Link>} />}
    <ul className="divide-y overflow-hidden rounded-xl border bg-card">{templates.map((item) => <li key={item.id} className="flex items-center justify-between gap-4 border-l-4 p-3" style={{ borderLeftColor: item.category?.color ?? "#6b7280" }}><div className="min-w-0"><div className="flex items-center gap-2"><span className="truncate font-medium">{item.category?.name ?? "Không danh mục"}</span>{!item.active && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Tạm dừng</span>}</div><p className="text-xs text-muted-foreground">Ngày {item.day_of_month} hàng tháng{item.note ? ` · ${item.note}` : ""}</p></div><div className="flex shrink-0 items-center gap-2"><span className={cn("font-tabular font-medium", item.type === "income" ? "text-primary" : "text-destructive")}>{item.type === "income" ? "+" : "-"}{formatVND(item.amount)}</span><Link href={`/recurring/${item.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Sửa</Link><Button variant="destructive" size="sm" onClick={() => void removeRecurring(item.id)}>Xóa</Button></div></li>)}</ul>
  </div>
}
