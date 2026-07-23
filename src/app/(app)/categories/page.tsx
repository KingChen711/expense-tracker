"use client"

import Link from "next/link"
import { Trash2 } from "lucide-react"
import { buttonVariants, Button } from "@/components/ui/button"
import { useLocalData } from "@/components/local-data-provider"
import { removeCategory } from "@/lib/local/repository"
import type { Category } from "@/lib/types"
import { cn } from "@/lib/utils"

function CategoryGroup({ title, categories }: { title: string; categories: Category[] }) {
  if (categories.length === 0) return null
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <ul className="divide-y rounded-xl border bg-card">
        {categories.map((category) => (
          <li key={category.id} className="flex items-center justify-between gap-4 p-3">
            <div className="flex items-center gap-2">
              <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
              <span className="font-medium">{category.name}</span>
            </div>
            <div className="flex gap-2">
              <Link href={`/categories/${category.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Sửa</Link>
              <Button variant="destructive" size="icon-sm" aria-label={`Xóa ${category.name}`} onClick={() => void removeCategory(category.id)}>
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function CategoriesPage() {
  const { snapshot, loading } = useLocalData()
  const categories = [...snapshot.categories].sort((a, b) => a.name.localeCompare(b.name, "vi"))
  const expense = categories.filter((category) => category.type === "expense")
  const income = categories.filter((category) => category.type === "income")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Danh mục</h1>
        <Link href="/categories/new" className={buttonVariants()}>+ Thêm danh mục</Link>
      </div>
      {loading ? <p className="text-sm text-muted-foreground">Đang mở dữ liệu trên máy…</p> : null}
      <CategoryGroup title="Chi tiêu" categories={expense} />
      <CategoryGroup title="Thu nhập" categories={income} />
    </div>
  )
}
