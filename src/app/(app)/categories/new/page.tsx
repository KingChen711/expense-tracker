import { CategoryForm } from "@/components/categories/category-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewCategoryPage() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Thêm danh mục</CardTitle>
      </CardHeader>
      <CardContent>
        <CategoryForm />
      </CardContent>
    </Card>
  )
}
