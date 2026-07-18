import Link from "next/link"
import { getRecurringTemplates } from "@/lib/data/recurring"
import { deleteRecurringTemplate } from "@/lib/actions/recurring"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatVND } from "@/lib/format"

export default async function RecurringPage() {
  const templates = await getRecurringTemplates()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Giao dịch định kỳ</h1>
        <Link href="/recurring/new" className={buttonVariants()}>
          + Thêm định kỳ
        </Link>
      </div>

      {templates.length === 0 && (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Chưa có giao dịch định kỳ nào. Thêm một khoản như tiền thuê nhà hay
          lương hàng tháng để app tự ghi nhận mỗi tháng.
        </div>
      )}

      <ul className="divide-y overflow-hidden rounded-lg border">
        {templates.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between gap-4 border-l-4 p-3"
            style={{ borderLeftColor: t.category?.color ?? "#6b7280" }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">
                  {t.category?.name ?? "Không danh mục"}
                </span>
                {!t.active && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    Tạm dừng
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Ngày {t.day_of_month} hàng tháng
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
                href={`/recurring/${t.id}/edit`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Sửa
              </Link>
              <form action={deleteRecurringTemplate}>
                <input type="hidden" name="id" value={t.id} />
                <Button type="submit" variant="destructive" size="sm">
                  Xoá
                </Button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
