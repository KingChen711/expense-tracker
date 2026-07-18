import { notFound } from "next/navigation"
import { getBudgetById } from "@/lib/data/budgets"
import { updateBudget } from "@/lib/actions/budgets"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function EditBudgetPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const budget = await getBudgetById(id)

  if (!budget) notFound()

  const updateWithId = updateBudget.bind(null, id)

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Sửa ngân sách — {budget.category.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={updateWithId} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="limit_amount">Hạn mức tháng này (đ)</Label>
            <Input
              id="limit_amount"
              name="limit_amount"
              type="number"
              min="0"
              step="1000"
              required
              defaultValue={budget.limitAmount}
            />
          </div>

          <Button type="submit" className="w-full">
            Lưu thay đổi
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
