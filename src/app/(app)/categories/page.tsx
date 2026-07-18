import Link from "next/link"
import { getCategories } from "@/lib/data/categories"
import { deleteCategory } from "@/lib/actions/categories"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/types"

function CategoryGroup({
  title,
  categories,
}: {
  title: string
  categories: Category[]
}) {
  if (categories.length === 0) return null

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <ul className="divide-y rounded-lg border">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-4 p-3">
            <div className="flex items-center gap-2">
              <span
                className="inline-block size-3 shrink-0 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              <span className="font-medium">{c.name}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/categories/${c.id}/edit`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Sửa
              </Link>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={c.id} />
                <Button type="submit" variant="destructive" size="sm">
                  Xoá
                </Button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function CategoriesPage() {
  const categories = await getCategories()
  const expense = categories.filter((c) => c.type === "expense")
  const income = categories.filter((c) => c.type === "income")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Danh mục</h1>
        <Link href="/categories/new" className={buttonVariants()}>
          + Thêm danh mục
        </Link>
      </div>

      <CategoryGroup title="Chi tiêu" categories={expense} />
      <CategoryGroup title="Thu nhập" categories={income} />
    </div>
  )
}
