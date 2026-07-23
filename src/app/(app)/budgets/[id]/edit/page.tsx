"use client"

import { useState, type FormEvent } from "react"
import { useParams, useRouter } from "next/navigation"
import { useLocalData } from "@/components/local-data-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { saveBudget } from "@/lib/local/repository"

export default function EditBudgetPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { snapshot, loading } = useLocalData()
  const [saving, setSaving] = useState(false)
  const budget = snapshot.budgets.find((item) => item.id === id)
  const category = snapshot.categories.find((item) => item.id === budget?.category_id)
  if (loading) return <p className="text-sm text-muted-foreground">Đang mở dữ liệu trên máy…</p>
  if (!budget) return <p className="text-sm text-muted-foreground">Không tìm thấy ngân sách.</p>

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    const formData = new FormData(event.currentTarget)
    await saveBudget({ id, category_id: budget!.category_id, limit_amount: Number(formData.get("limit_amount")) })
    router.push("/budgets")
  }

  return <Card className="mx-auto max-w-md"><CardHeader><CardTitle>Sửa ngân sách — {category?.name}</CardTitle></CardHeader><CardContent><form onSubmit={handleSubmit} className="space-y-4"><div className="space-y-2"><Label htmlFor="limit_amount">Hạn mức tháng này (đ)</Label><Input id="limit_amount" name="limit_amount" type="number" min="0" step="1000" required defaultValue={budget.limit_amount} /></div><Button type="submit" className="w-full" disabled={saving}>{saving ? "Đang lưu…" : "Lưu thay đổi"}</Button></form></CardContent></Card>
}
