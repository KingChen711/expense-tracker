"use client"

import { useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category, Transaction, TransactionType } from "@/lib/types"
import { saveTransaction } from "@/lib/local/repository"

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function TransactionForm({
  categories,
  recentCategoryIds = [],
  transaction,
}: {
  categories: Category[]
  recentCategoryIds?: string[]
  transaction?: Transaction
}) {
  const router = useRouter()
  const [type, setType] = useState<TransactionType>(
    transaction?.type ?? "expense"
  )
  const [categoryId, setCategoryId] = useState<string | null>(
    transaction?.category_id ?? null
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    const formData = new FormData(event.currentTarget)
    await saveTransaction({
      id: transaction?.id,
      type,
      category_id: categoryId,
      amount: Number(formData.get("amount")),
      occurred_on: String(formData.get("occurred_on")),
      note: String(formData.get("note") || "").trim() || null,
    })
    router.push("/transactions")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      <Button type="submit" className="h-11 w-full text-base" disabled={saving}>
        {saving ? "Đang lưu…" : transaction ? "Lưu thay đổi" : "Thêm giao dịch"}
      </Button>
    </form>
  )
}
