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
import type { Category, TransactionType } from "@/lib/types"
import { saveCategory } from "@/lib/local/repository"

const TYPE_ITEMS = [
  { value: "expense", label: "Chi tiêu" },
  { value: "income", label: "Thu nhập" },
]

export function CategoryForm({
  category,
}: {
  category?: Category
}) {
  const router = useRouter()
  const [color, setColor] = useState(category?.color ?? "#6b7280")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    const formData = new FormData(event.currentTarget)
    await saveCategory({
      id: category?.id,
      name: String(formData.get("name")),
      type: formData.get("type") as TransactionType,
      color: String(formData.get("color")),
    })
    router.push("/categories")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Tên danh mục</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={category?.name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Loại</Label>
        <Select
          name="type"
          items={TYPE_ITEMS}
          defaultValue={category?.type ?? ("expense" as TransactionType)}
        >
          <SelectTrigger id="type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Chi tiêu</SelectItem>
            <SelectItem value="income">Thu nhập</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Màu</Label>
        <div className="flex items-center gap-3">
          <input
            id="color"
            name="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-9 w-16 cursor-pointer rounded-md border border-input"
          />
          <span className="text-sm text-muted-foreground">{color}</span>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Đang lưu…" : category ? "Lưu thay đổi" : "Thêm danh mục"}
      </Button>
    </form>
  )
}
