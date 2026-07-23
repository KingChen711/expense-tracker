"use client"

import { useParams } from "next/navigation"
import { CategoryForm } from "@/components/categories/category-form"
import { useLocalData } from "@/components/local-data-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>()
  const { snapshot, loading } = useLocalData()
  const category = snapshot.categories.find((item) => item.id === id)
  if (loading) return <p className="text-sm text-muted-foreground">Đang mở dữ liệu trên máy…</p>
  if (!category) return <p className="text-sm text-muted-foreground">Không tìm thấy danh mục.</p>

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader><CardTitle>Sửa danh mục</CardTitle></CardHeader>
      <CardContent><CategoryForm category={category} /></CardContent>
    </Card>
  )
}
