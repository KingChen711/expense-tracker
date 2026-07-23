"use client"

import { NewBudgetForm } from "@/components/budgets/new-budget-form"
import { useLocalData } from "@/components/local-data-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { currentMonthStart } from "@/lib/local/repository"

export default function NewBudgetPage() {
  const { snapshot } = useLocalData()
  const used = new Set(snapshot.budgets.filter((item) => item.month === currentMonthStart()).map((item) => item.category_id))
  const categories = snapshot.categories.filter((item) => item.type === "expense" && !used.has(item.id))
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader><CardTitle>Thêm ngân sách</CardTitle></CardHeader>
      <CardContent>{categories.length === 0 ? <p className="text-sm text-muted-foreground">Tất cả danh mục chi tiêu đã có ngân sách, hoặc bạn chưa có danh mục chi tiêu.</p> : <NewBudgetForm categories={categories} />}</CardContent>
    </Card>
  )
}
