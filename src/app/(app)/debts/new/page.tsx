import { createDebt } from "@/lib/actions/debts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewDebtPage() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Thêm khoản nợ</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={createDebt} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="creditor_name">Nợ ai</Label>
            <Input id="creditor_name" name="creditor_name" type="text" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_amount">Tổng số tiền (đ)</Label>
            <Input
              id="total_amount"
              name="total_amount"
              type="number"
              min="0"
              step="1000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Hạn trả (không bắt buộc)</Label>
            <Input id="due_date" name="due_date" type="date" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Input id="note" name="note" type="text" placeholder="Không bắt buộc" />
          </div>

          <Button type="submit" className="w-full">
            Thêm khoản nợ
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
