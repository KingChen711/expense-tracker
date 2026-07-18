import { getCategories } from "@/lib/data/categories"
import { createRecurringTemplate } from "@/lib/actions/recurring"
import { RecurringForm } from "@/components/recurring/recurring-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewRecurringPage() {
  const categories = await getCategories()

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Thêm giao dịch định kỳ</CardTitle>
      </CardHeader>
      <CardContent>
        <RecurringForm categories={categories} action={createRecurringTemplate} />
      </CardContent>
    </Card>
  )
}
