"use client"

import { useMemo, useState } from "react"
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
import type { Category, Transaction, TransactionType } from "@/lib/types"

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

const TYPE_ITEMS = [
  { value: "expense", label: "Chi tiêu" },
  { value: "income", label: "Thu nhập" },
]

export function TransactionForm({
  categories,
  transaction,
  action,
}: {
  categories: Category[]
  transaction?: Transaction
  action: (formData: FormData) => void
}) {
  const [type, setType] = useState<TransactionType>(
    transaction?.type ?? "expense"
  )
  const [categoryId, setCategoryId] = useState<string | null>(
    transaction?.category_id ?? null
  )

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

  return (
    <form action={action} className="space-y-4">
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
          defaultValue={transaction?.amount}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="occurred_on">Ngày</Label>
        <Input
          id="occurred_on"
          name="occurred_on"
          type="date"
          required
          defaultValue={transaction?.occurred_on ?? todayISO()}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Ghi chú</Label>
        <Input
          id="note"
          name="note"
          type="text"
          defaultValue={transaction?.note ?? ""}
          placeholder="Không bắt buộc"
        />
      </div>

      <Button type="submit" className="w-full">
        {transaction ? "Lưu thay đổi" : "Thêm giao dịch"}
      </Button>
    </form>
  )
}
