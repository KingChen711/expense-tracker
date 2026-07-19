import { getCategories } from "@/lib/data/categories"
import { getRecentCategoryIds } from "@/lib/data/transactions"
import { createTransaction } from "@/lib/actions/transactions"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewTransactionPage() {
  const [categories, recentCategoryIds] = await Promise.all([
    getCategories(),
    getRecentCategoryIds(),
  ])

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Thêm giao dịch</CardTitle>
        <p className="text-sm text-muted-foreground">Ghi nhanh khoản thu hoặc chi vừa phát sinh.</p>
      </CardHeader>
      <CardContent>
        <TransactionForm
          categories={categories}
          recentCategoryIds={recentCategoryIds}
          action={createTransaction}
        />
      </CardContent>
    </Card>
  )
}
