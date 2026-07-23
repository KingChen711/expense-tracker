"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Pencil, ReceiptText, Trash2 } from "lucide-react"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { useLocalData } from "@/components/local-data-provider"
import { Button, buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { removeTransaction } from "@/lib/local/repository"
import { formatVND } from "@/lib/format"
import { cn } from "@/lib/utils"

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${date}T00:00:00`))
}

export default function TransactionsPage() {
  const searchParams = useSearchParams()
  const { snapshot, loading } = useLocalData()
  const params = {
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
    type: searchParams.get("type") || undefined,
    category: searchParams.get("category") || undefined,
    q: searchParams.get("q") || undefined,
  }
  const hasFilters = Boolean(params.from || params.to || params.type || params.category || params.q)
  const query = params.q?.trim().toLocaleLowerCase("vi")
  const categoryMap = new Map(snapshot.categories.map((category) => [category.id, category]))
  const transactions = snapshot.transactions
    .filter((item) => !params.from || item.occurred_on >= params.from)
    .filter((item) => !params.to || item.occurred_on <= params.to)
    .filter((item) => !params.type || params.type === "all" || item.type === params.type)
    .filter((item) => !params.category || params.category === "all" || item.category_id === params.category)
    .map((item) => ({ ...item, category: item.category_id ? categoryMap.get(item.category_id) ?? null : null }))
    .filter((item) => !query || item.note?.toLocaleLowerCase("vi").includes(query) || item.category?.name.toLocaleLowerCase("vi").includes(query))
    .sort((a, b) => b.occurred_on.localeCompare(a.occurred_on) || (b.created_at ?? "").localeCompare(a.created_at ?? ""))

  const groups = transactions.reduce(
    (result, transaction) => {
      const current = result.at(-1)
      if (!current || current.date !== transaction.occurred_on) result.push({ date: transaction.occurred_on, transactions: [transaction] })
      else current.transactions.push(transaction)
      return result
    },
    [] as { date: string; transactions: typeof transactions }[]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Giao dịch</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Đọc và tìm kiếm trực tiếp từ thiết bị.</p>
        </div>
        <Link href="/transactions/new" className={buttonVariants()}>
          <span className="hidden sm:inline">+ Thêm giao dịch</span><span className="sm:hidden">+ Thêm</span>
        </Link>
      </div>

      <TransactionFilters categories={snapshot.categories} defaultValues={params} hasFilters={hasFilters} />
      {loading && <p className="text-sm text-muted-foreground">Đang mở dữ liệu trên máy…</p>}

      {!loading && transactions.length === 0 && (
        <EmptyState
          icon={ReceiptText}
          title={hasFilters ? "Không tìm thấy giao dịch" : "Bắt đầu ghi lại chi tiêu"}
          description={hasFilters ? "Không có giao dịch nào khớp với bộ lọc hiện tại." : "Giao dịch mới sẽ xuất hiện ngay cả khi thiết bị đang offline."}
          action={<Link href={hasFilters ? "/transactions" : "/transactions/new"} className={buttonVariants()}>{hasFilters ? "Xóa bộ lọc" : "+ Thêm giao dịch đầu tiên"}</Link>}
        />
      )}

      <div className="space-y-5">
        {groups.map((group) => {
          const net = group.transactions.reduce((sum, item) => sum + (item.type === "income" ? item.amount : -item.amount), 0)
          return (
            <section key={group.date}>
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="text-xs font-semibold capitalize text-muted-foreground">{formatDateLabel(group.date)}</h2>
                <span className={cn("font-tabular text-xs font-medium", net >= 0 ? "text-primary" : "text-destructive")}>{net >= 0 ? "+" : ""}{formatVND(net)}</span>
              </div>
              <ul className="overflow-hidden rounded-xl border bg-card">
                {group.transactions.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 border-l-4 p-3.5 not-last:border-b" style={{ borderLeftColor: item.category?.color ?? "#6b7280" }}>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.category?.name ?? "Không danh mục"}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.note || (item.type === "income" ? "Khoản thu" : "Khoản chi")}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className={cn("font-tabular mr-1 text-sm font-semibold", item.type === "income" ? "text-primary" : "text-destructive")}>{item.type === "income" ? "+" : "-"}{formatVND(item.amount)}</span>
                      <Link href={`/transactions/${item.id}/edit`} aria-label="Sửa giao dịch" className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}><Pencil className="size-3.5" /></Link>
                      <Button variant="destructive" size="icon-sm" aria-label="Xóa giao dịch" onClick={() => void removeTransaction(item.id)}><Trash2 className="size-3.5" /></Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
