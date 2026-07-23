"use client"

import { useParams } from "next/navigation"
import { RecurringForm } from "@/components/recurring/recurring-form"
import { useLocalData } from "@/components/local-data-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EditRecurringPage() {
  const { id } = useParams<{ id: string }>()
  const { snapshot, loading } = useLocalData()
  const record = snapshot.recurring_templates.find((item) => item.id === id)
  if (loading) return <p className="text-sm text-muted-foreground">Đang mở dữ liệu trên máy…</p>
  if (!record) return <p className="text-sm text-muted-foreground">Không tìm thấy giao dịch định kỳ.</p>
  const template = { ...record, category: snapshot.categories.find((item) => item.id === record.category_id) ?? null }
  return <Card className="mx-auto max-w-md"><CardHeader><CardTitle>Sửa giao dịch định kỳ</CardTitle></CardHeader><CardContent><RecurringForm categories={snapshot.categories} template={template} /></CardContent></Card>
}
