"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Category } from "@/lib/types"
import { saveBudget } from "@/lib/local/repository"

export function NewBudgetForm({
  categories,
}: {
  categories: Category[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    const formData = new FormData(event.currentTarget)
    await saveBudget({ category_id: String(formData.get("category_id")), limit_amount: Number(formData.get("limit_amount")) })
    router.push("/budgets")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category_id">Danh mục</Label>
        <Select
          name="category_id"
          items={categories.map((c) => ({ value: c.id, label: c.name }))}
          defaultValue={categories[0]?.id}
        >
          <SelectTrigger id="category_id" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="limit_amount">Hạn mức tháng này (đ)</Label>
        <Input
          id="limit_amount"
          name="limit_amount"
          type="number"
          min="0"
          step="1000"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={saving}>{saving ? "Đang lưu…" : "Thêm ngân sách"}</Button>
    </form>
  )
}
