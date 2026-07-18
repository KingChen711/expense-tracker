import { notFound } from "next/navigation"
import { getCategories } from "@/lib/data/categories"
import { getRecurringTemplateById } from "@/lib/data/recurring"
import { updateRecurringTemplate } from "@/lib/actions/recurring"
import { RecurringForm } from "@/components/recurring/recurring-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function EditRecurringPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [categories, template] = await Promise.all([
    getCategories(),
    getRecurringTemplateById(id),
  ])

  if (!template) notFound()

  const updateWithId = updateRecurringTemplate.bind(null, id)

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Sửa giao dịch định kỳ</CardTitle>
      </CardHeader>
      <CardContent>
        <RecurringForm
          categories={categories}
          template={template}
          action={updateWithId}
        />
      </CardContent>
    </Card>
  )
}
