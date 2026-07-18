import Link from "next/link"
import { getTransactions } from "@/lib/data/transactions"
import { getCategories } from "@/lib/data/categories"
import { deleteTransaction } from "@/lib/actions/transactions"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { Button, buttonVariants } from "@/components/ui/button"
import { formatVND } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { TransactionType } from "@/lib/types"
import { SubmitButton } from "@/components/ui/submit-button"

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Giao dịch</h1>
        <Link href="/transactions/new" className={buttonVariants()}>
          + Thêm giao dịch
        </Link>
      </div>

      <TransactionFilters
        categories={categories}
        defaultValues={params}
        hasFilters={hasFilters}
      />

      {transactions.length === 0 && (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {hasFilters
            ? "Không có giao dịch nào khớp với bộ lọc hiện tại."
            : 'Chưa có giao dịch nào. Ghi lại khoản chi hoặc thu đầu tiên để bắt đầu theo dõi.'}
        </div>
      )}

      <ul className="divide-y overflow-hidden rounded-lg border">
        {transactions.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between gap-4 border-l-4 p-3"
            style={{ borderLeftColor: t.category?.color ?? "#6b7280" }}
          >
            <div className="min-w-0">
              <p className="truncate font-medium">
                {t.category?.name ?? "Không danh mục"}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.occurred_on}
                {t.note ? ` · ${t.note}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span
                className={cn(
                  "font-tabular font-medium",
                  t.type === "income" ? "text-primary" : "text-destructive"
                )}
              >
                {t.type === "income" ? "+" : "-"}
                {formatVND(t.amount)}
              </span>
              <Link
                href={`/transactions/${t.id}/edit`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Sửa
              </Link>
              <form action={deleteTransaction}>
                <input type="hidden" name="id" value={t.id} />
                <SubmitButton variant="destructive" size="sm">
                  Xoá
                </SubmitButton>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
