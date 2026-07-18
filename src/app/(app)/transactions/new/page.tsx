import { getCategories } from "@/lib/data/categories"
import { createTransaction } from "@/lib/actions/transactions"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewTransactionPage() {
  const categories = await getCategories()

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Thêm giao dịch</CardTitle>
      </CardHeader>
      <CardContent>
        <TransactionForm categories={categories} action={createTransaction} />
      </CardContent>
    </Card>
  )
}
