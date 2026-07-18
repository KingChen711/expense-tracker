import { notFound } from "next/navigation"
import { getCategoryById } from "@/lib/data/categories"
import { updateCategory } from "@/lib/actions/categories"
import { CategoryForm } from "@/components/categories/category-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const category = await getCategoryById(id)

  if (!category) notFound()

  const updateWithId = updateCategory.bind(null, id)

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Sửa danh mục</CardTitle>
      </CardHeader>
      <CardContent>
        <CategoryForm category={category} action={updateWithId} />
      </CardContent>
    </Card>
  )
}
