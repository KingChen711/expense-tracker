import Link from "next/link"
import { getDebts } from "@/lib/data/debts"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatVND } from "@/lib/format"

export default async function DebtsPage() {
  const debts = await getDebts()
  const active = debts.filter((d) => d.status === "active")
  const paid = debts.filter((d) => d.status === "paid")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Theo dõi nợ</h1>
        <Link href="/debts/new" className={buttonVariants()}>
          + Thêm khoản nợ
        </Link>
      </div>

      {debts.length === 0 && (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Chưa có khoản nợ nào. Thêm khoản bạn đang nợ người khác để theo dõi
          tiến độ trả nợ.
        </div>
      )}

      {active.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            Đang nợ
          </h2>
          <ul className="divide-y rounded-lg border">
            {active.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/debts/${d.id}`}
                  className="flex items-center justify-between gap-4 p-3 hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{d.creditorName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {d.dueDate ? `Hạn trả: ${d.dueDate}` : "Không có hạn trả"}
                      {d.note ? ` · ${d.note}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-tabular font-medium text-destructive">
                      Còn {formatVND(d.remaining)}
                    </p>
                    <p className="font-tabular text-xs text-muted-foreground">
                      / {formatVND(d.totalAmount)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {paid.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            Đã trả xong
          </h2>
          <ul className="divide-y rounded-lg border">
            {paid.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/debts/${d.id}`}
                  className={cn(
                    "flex items-center justify-between gap-4 p-3 hover:bg-muted",
                    "text-muted-foreground"
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate">{d.creditorName}</p>
                    {d.note && <p className="truncate text-xs">{d.note}</p>}
                  </div>
                  <p className="font-tabular shrink-0 text-sm">
                    {formatVND(d.totalAmount)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
