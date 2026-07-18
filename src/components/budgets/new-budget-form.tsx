"use client"

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
import { SubmitButton } from "@/components/ui/submit-button"

export function NewBudgetForm({
  categories,
  action,
}: {
  categories: Category[]
  action: (formData: FormData) => void
}) {
  return (
    <form action={action} className="space-y-4">
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

      <SubmitButton className="w-full">
        Thêm ngân sách
      </SubmitButton>
    </form>
  )
}
