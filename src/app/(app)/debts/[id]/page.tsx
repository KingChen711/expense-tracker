import { notFound } from "next/navigation"
import Link from "next/link"
import { getDebtById, getDebtPayments } from "@/lib/data/debts"
import { addDebtPayment, deleteDebt, deleteDebtPayment } from "@/lib/actions/debts"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatVND } from "@/lib/format"

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default async function DebtDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [debt, payments] = await Promise.all([
    getDebtById(id),
    getDebtPayments(id),
  ])

  if (!debt) notFound()

  const addPaymentWithId = addDebtPayment.bind(null, id)
  const percent =
    debt.totalAmount > 0
      ? Math.min(100, Math.round((debt.totalPaid / debt.totalAmount) * 100))
      : 0

  return (
    <div className="mx-auto max-w-md space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{debt.creditorName}</CardTitle>
            <div className="flex gap-2">
              <Link
                href={`/debts/${debt.id}/edit`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Sửa
              </Link>
              <form action={deleteDebt}>
                <input type="hidden" name="id" value={debt.id} />
                <Button type="submit" variant="destructive" size="sm">
                  Xoá
                </Button>
              </form>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {debt.dueDate && (
            <p className="text-sm text-muted-foreground">
              Hạn trả: {debt.dueDate}
            </p>
          )}
          {debt.note && <p className="text-sm text-muted-foreground">{debt.note}</p>}

          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="font-tabular text-sm">
            Đã trả {formatVND(debt.totalPaid)} / {formatVND(debt.totalAmount)}
          </p>
          <p
            className={
              debt.remaining > 0
                ? "font-tabular text-lg font-semibold text-destructive"
                : "font-tabular text-lg font-semibold text-primary"
            }
          >
            {debt.remaining > 0
              ? `Còn nợ ${formatVND(debt.remaining)}`
              : "Đã trả xong"}
          </p>
        </CardContent>
      </Card>

      {debt.remaining > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ghi nhận trả nợ</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addPaymentWithId} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Số tiền trả (đ)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="1000"
                  max={debt.remaining}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paid_on">Ngày trả</Label>
                <Input
                  id="paid_on"
                  name="paid_on"
                  type="date"
                  required
                  defaultValue={todayISO()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Input id="note" name="note" type="text" placeholder="Không bắt buộc" />
              </div>
              <Button type="submit" className="w-full">
                Ghi nhận
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Lịch sử trả nợ
        </h2>
        {payments.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            Chưa có lần trả nào. Ghi nhận lần trả đầu tiên ở form phía trên.
          </div>
        ) : (
          <ul className="divide-y rounded-lg border">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 p-3">
                <div>
                  <p className="font-tabular font-medium">{formatVND(p.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.paidOn}
                    {p.note ? ` · ${p.note}` : ""}
                  </p>
                </div>
                <form action={deleteDebtPayment}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="debt_id" value={debt.id} />
                  <Button type="submit" variant="destructive" size="sm">
                    Xoá
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
