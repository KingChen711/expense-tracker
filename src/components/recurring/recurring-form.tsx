"use client"

import { useMemo, useState, type FormEvent } from "react"
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
import type { Category, RecurringTemplate, TransactionType } from "@/lib/types"
import { saveRecurring } from "@/lib/local/repository"

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

const TYPE_ITEMS = [
  { value: "expense", label: "Chi tiêu" },
  { value: "income", label: "Thu nhập" },
]

export function RecurringForm({
  categories,
  template,
}: {
  categories: Category[]
  template?: RecurringTemplate
}) {
  const router = useRouter()
  const [type, setType] = useState<TransactionType>(template?.type ?? "expense")
  const [categoryId, setCategoryId] = useState<string | null>(
    template?.category_id ?? null
  )
  const [saving, setSaving] = useState(false)

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  )

  const categoryItems = useMemo(
    () => [
      { value: null, label: "-- Không chọn --" },
      ...filteredCategories.map((c) => ({ value: c.id, label: c.name })),
    ],
    [filteredCategories]
  )

  function handleTypeChange(value: unknown) {
    setType(value as TransactionType)
    setCategoryId(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    const formData = new FormData(event.currentTarget)
    await saveRecurring({
      id: template?.id,
      type,
      category_id: categoryId,
      amount: Number(formData.get("amount")),
      day_of_month: Number(formData.get("day_of_month")),
      start_date: String(formData.get("start_date")),
      note: String(formData.get("note") || "").trim() || null,
      active: template ? formData.get("active") === "on" : true,
    })
    router.push("/recurring")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Loại giao dịch</Label>
        <Select
          name="type"
          items={TYPE_ITEMS}
          value={type}
          onValueChange={handleTypeChange}
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
        <Label htmlFor="category_id">Danh mục</Label>
        <Select
          name="category_id"
          items={categoryItems}
          value={categoryId}
          onValueChange={(value) => setCategoryId(value as string | null)}
        >
          <SelectTrigger id="category_id" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>-- Không chọn --</SelectItem>
            {filteredCategories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Số tiền (đ)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          min="0"
          step="1000"
          required
          defaultValue={template?.amount}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="day_of_month">Ngày trong tháng (1-31)</Label>
        <Input
          id="day_of_month"
          name="day_of_month"
          type="number"
          min="1"
          max="31"
          required
          defaultValue={template?.day_of_month ?? 1}
        />
        <p className="text-xs text-muted-foreground">
          Nếu tháng không có ngày này (ví dụ 31 vào tháng 2), giao dịch sẽ
          được tạo vào ngày cuối cùng của tháng đó.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="start_date">Bắt đầu từ ngày</Label>
        <Input
          id="start_date"
          name="start_date"
          type="date"
          required
          defaultValue={template?.start_date ?? todayISO()}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Ghi chú</Label>
        <Input
          id="note"
          name="note"
          type="text"
          defaultValue={template?.note ?? ""}
          placeholder="Không bắt buộc"
        />
      </div>

      {template && (
        <div className="flex items-center gap-2">
          <input
            id="active"
            name="active"
            type="checkbox"
            defaultChecked={template.active}
            className="size-4 rounded border-input"
          />
          <Label htmlFor="active">Đang hoạt động</Label>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={saving}>{saving ? "Đang lưu…" : template ? "Lưu thay đổi" : "Thêm giao dịch định kỳ"}</Button>
    </form>
  )
}
