import { getUnbudgetedExpenseCategories } from "@/lib/data/budgets"
import { createBudget } from "@/lib/actions/budgets"
import { NewBudgetForm } from "@/components/budgets/new-budget-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewBudgetPage() {
  const categories = await getUnbudgetedExpenseCategories()

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Thêm ngân sách</CardTitle>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Tất cả danh mục chi tiêu đã có ngân sách trong tháng này, hoặc
            bạn chưa có danh mục chi tiêu nào.
          </p>
        ) : (
          <NewBudgetForm categories={categories} action={createBudget} />
        )}
      </CardContent>
    </Card>
  )
}
