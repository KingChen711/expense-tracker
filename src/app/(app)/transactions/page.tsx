import Link from "next/link"
import { Pencil, ReceiptText, Trash2 } from "lucide-react"
import { getTransactions } from "@/lib/data/transactions"
import { getCategories } from "@/lib/data/categories"
import { deleteTransaction } from "@/lib/actions/transactions"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { buttonVariants } from "@/components/ui/button"
import { formatVND } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { TransactionType } from "@/lib/types"
import { SubmitButton } from "@/components/ui/submit-button"
import { EmptyState } from "@/components/ui/empty-state"

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${date}T00:00:00`))
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string
    to?: string
    type?: string
    category?: string
    q?: string
  }>
}) {
  const params = await searchParams
  const type: TransactionType | undefined =
    params.type === "income" || params.type === "expense"
      ? params.type
      : undefined
  const categoryId =
    params.category && params.category !== "all" ? params.category : undefined
  const hasFilters = Boolean(
    params.from || params.to || params.type || params.category || params.q
  )

  const [transactions, categories] = await Promise.all([
    getTransactions({
      from: params.from,
      to: params.to,
      type,
      categoryId,
      q: params.q,
    }),
    getCategories(),
  ])

  const transactionGroups = transactions.reduce(
    (groups, transaction) => {
      const group = groups.at(-1)
      if (!group || group.date !== transaction.occurred_on) {
        groups.push({ date: transaction.occurred_on, transactions: [transaction] })
      } else {
        group.transactions.push(transaction)
      }
      return groups
    },
    [] as { date: string; transactions: typeof transactions }[]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Giao dịch</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Theo dõi từng khoản tiền đi và đến.</p>
        </div>
        <Link href="/transactions/new" className={buttonVariants()}>
          <span className="hidden sm:inline">+ Thêm giao dịch</span>
          <span className="sm:hidden">+ Thêm</span>
        </Link>
      </div>

      <TransactionFilters
        categories={categories}
        defaultValues={params}
        hasFilters={hasFilters}
      />

      {transactions.length === 0 && (
        <EmptyState
          icon={ReceiptText}
          title={hasFilters ? "Không tìm thấy giao dịch" : "Bắt đầu ghi lại chi tiêu"}
          description={
            hasFilters
              ? "Không có giao dịch nào khớp với bộ lọc hiện tại. Hãy thử nới điều kiện tìm kiếm."
              : "Ghi lại khoản thu hoặc chi đầu tiên để dòng tiền của bạn bắt đầu có ý nghĩa."
          }
          action={
            hasFilters ? (
              <Link href="/transactions" className={buttonVariants({ variant: "outline" })}>
                Xóa bộ lọc
              </Link>
            ) : (
              <Link href="/transactions/new" className={buttonVariants()}>
                + Thêm giao dịch đầu tiên
              </Link>
            )
          }
        />
      )}

      {transactionGroups.length > 0 && (
        <div className="space-y-5">
          {transactionGroups.map((group) => {
            const groupNet = group.transactions.reduce(
              (total, transaction) => total + (transaction.type === "income" ? transaction.amount : -transaction.amount),
              0
            )
            return (
              <section key={group.date}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <h2 className="text-xs font-semibold capitalize text-muted-foreground">{formatDateLabel(group.date)}</h2>
                  <span className={cn("font-tabular text-xs font-medium", groupNet >= 0 ? "text-primary" : "text-destructive")}>
                    {groupNet >= 0 ? "+" : ""}{formatVND(groupNet)}
                  </span>
                </div>
                <ul className="overflow-hidden rounded-xl border bg-card">
                  {group.transactions.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between gap-3 border-l-4 p-3.5 not-last:border-b"
                      style={{ borderLeftColor: t.category?.color ?? "#6b7280" }}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{t.category?.name ?? "Không danh mục"}</p>
                        <p className="truncate text-xs text-muted-foreground">{t.note || (t.type === "income" ? "Khoản thu" : "Khoản chi")}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        <span className={cn("font-tabular mr-1 text-sm font-semibold", t.type === "income" ? "text-primary" : "text-destructive")}>
                          {t.type === "income" ? "+" : "-"}{formatVND(t.amount)}
                        </span>
                        <Link
                          href={`/transactions/${t.id}/edit`}
                          aria-label={`Sửa giao dịch ${t.category?.name ?? "không danh mục"}`}
                          className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                        <form action={deleteTransaction}>
                          <input type="hidden" name="id" value={t.id} />
                          <SubmitButton variant="destructive" size="icon-sm" aria-label={`Xóa giao dịch ${t.category?.name ?? "không danh mục"}`}>
                            <Trash2 className="size-3.5" />
                          </SubmitButton>
                        </form>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
