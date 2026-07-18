"use client"

import Link from "next/link"
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

const TYPE_ITEMS = [
  { value: "all", label: "Tất cả" },
  { value: "income", label: "Thu nhập" },
  { value: "expense", label: "Chi tiêu" },
]

export function TransactionFilters({
  categories,
  defaultValues,
  hasFilters,
}: {
  categories: Category[]
  defaultValues: {
    from?: string
    to?: string
    type?: string
    category?: string
    q?: string
  }
  hasFilters: boolean
}) {
  const categoryItems = [
    { value: "all", label: "Tất cả danh mục" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ]

  return (
    <form
      action="/transactions"
      method="GET"
      className="flex flex-wrap items-end gap-3 rounded-lg border p-3"
    >
      <div className="w-40 space-y-1.5">
        <Label htmlFor="from">Từ ngày</Label>
        <Input id="from" name="from" type="date" defaultValue={defaultValues.from} />
      </div>

      <div className="w-40 space-y-1.5">
        <Label htmlFor="to">Đến ngày</Label>
        <Input id="to" name="to" type="date" defaultValue={defaultValues.to} />
      </div>

      <div className="w-36 space-y-1.5">
        <Label htmlFor="type">Loại</Label>
        <Select
          name="type"
          items={TYPE_ITEMS}
          defaultValue={defaultValues.type ?? "all"}
        >
          <SelectTrigger id="type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="income">Thu nhập</SelectItem>
            <SelectItem value="expense">Chi tiêu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-48 space-y-1.5">
        <Label htmlFor="category">Danh mục</Label>
        <Select
          name="category"
          items={categoryItems}
          defaultValue={defaultValues.category ?? "all"}
        >
          <SelectTrigger id="category" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-48 flex-1 space-y-1.5">
        <Label htmlFor="q">Tìm kiếm</Label>
        <Input
          id="q"
          name="q"
          type="text"
          placeholder="Ghi chú, danh mục..."
          defaultValue={defaultValues.q}
        />
      </div>

      <div className="flex items-center gap-2">
        <SubmitButton>Lọc</SubmitButton>
        {hasFilters && (
          <Link href="/transactions" className="text-sm text-muted-foreground underline">
            Xoá lọc
          </Link>
        )}
      </div>
    </form>
  )
}
