import Link from "next/link"
import { WalletCards } from "lucide-react"
import { getBudgetsWithSpending } from "@/lib/data/budgets"
import { deleteBudget } from "@/lib/actions/budgets"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatVND } from "@/lib/format"
import { SubmitButton } from "@/components/ui/submit-button"
import { EmptyState } from "@/components/ui/empty-state"

export default async function BudgetsPage() {
  const budgets = await getBudgetsWithSpending()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Ngân sách</h1>
          <p className="text-sm text-muted-foreground">Theo tháng hiện tại</p>
        </div>
        <Link href="/budgets/new" className={buttonVariants()}>
          + Thêm ngân sách
        </Link>
      </div>

      {budgets.length === 0 && (
        <EmptyState
          icon={WalletCards}
          title="Đặt ngân sách đầu tiên"
          description="Đặt hạn mức cho một danh mục chi tiêu để biết khi nào cần chậm lại."
          action={<Link href="/budgets/new" className={buttonVariants()}>+ Thêm ngân sách</Link>}
        />
      )}

      <ul className="space-y-3">
        {budgets.map((b) => {
          const percent = Math.min(
            100,
            Math.round((b.spent / b.limitAmount) * 100)
          )
          const over = b.spent > b.limitAmount
          const nearLimit = !over && percent >= 80

          return (
            <li
              key={b.id}
              className="rounded-lg border-l-4 border-y border-r p-4"
              style={{ borderLeftColor: b.category.color }}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">{b.category.name}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/budgets/${b.id}/edit`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Sửa
                  </Link>
                  <form action={deleteBudget}>
                    <input type="hidden" name="id" value={b.id} />
                    <SubmitButton variant="destructive" size="sm">
                      Xoá
                    </SubmitButton>
                  </form>
                </div>
              </div>

              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    over
                      ? "bg-destructive"
                      : nearLimit
                        ? "bg-warning"
                        : "bg-primary"
                  )}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <p
                className={cn(
                  "font-tabular mt-1 text-sm",
                  over
                    ? "font-medium text-destructive"
                    : nearLimit
                      ? "font-medium text-warning"
                      : "text-muted-foreground"
                )}
              >
                {formatVND(b.spent)} / {formatVND(b.limitAmount)}
                {over && " · Vượt ngân sách"}
                {nearLimit && " · Sắp chạm hạn mức"}
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
