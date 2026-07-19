"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category, Transaction, TransactionType } from "@/lib/types"
import { SubmitButton } from "@/components/ui/submit-button"

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function TransactionForm({
  categories,
  recentCategoryIds = [],
  transaction,
  action,
}: {
  categories: Category[]
  recentCategoryIds?: string[]
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

  const recentCategories = useMemo(
    () =>
      recentCategoryIds
        .map((id) => categories.find((category) => category.id === id))
        .filter((category): category is Category => Boolean(category && category.type === type)),
    [categories, recentCategoryIds, type]
  )

  function handleTypeChange(value: unknown) {
    setType(value as TransactionType)
    setCategoryId(null)
  }

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="type">Loại giao dịch</Label>
        <input type="hidden" name="type" value={type} />
        <div className="grid grid-cols-2 rounded-xl bg-muted p-1">
          <Button
            type="button"
            variant={type === "expense" ? "destructive" : "ghost"}
            className="h-10"
            onClick={() => handleTypeChange("expense")}
          >
            Chi tiêu
          </Button>
          <Button
            type="button"
            variant={type === "income" ? "default" : "ghost"}
            className="h-10"
            onClick={() => handleTypeChange("income")}
          >
            Thu nhập
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Số tiền</Label>
        <div className="relative">
          <Input
            id="amount"
            name="amount"
            type="number"
            inputMode="numeric"
            min="0"
            step="1000"
            required
            autoFocus={!transaction}
            defaultValue={transaction?.amount}
            placeholder="0"
            className="h-12 pr-10 text-lg font-semibold"
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">đ</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category_id">Danh mục</Label>
        {!transaction && recentCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recentCategories.map((category) => (
              <Button
                key={category.id}
                type="button"
                variant={categoryId === category.id ? "secondary" : "outline"}
                size="sm"
                onClick={() => setCategoryId(category.id)}
              >
                <span className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
                {category.name}
              </Button>
            ))}
          </div>
        )}
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

      <div className="grid gap-5 sm:grid-cols-2">
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
      </div>

      <SubmitButton className="h-11 w-full text-base">
        {transaction ? "Lưu thay đổi" : "Thêm giao dịch"}
      </SubmitButton>
    </form>
  )
}
