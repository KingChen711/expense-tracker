import { notFound } from "next/navigation"
import { getCategories } from "@/lib/data/categories"
import { getTransactionById } from "@/lib/data/transactions"
import { updateTransaction } from "@/lib/actions/transactions"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [categories, transaction] = await Promise.all([
    getCategories(),
    getTransactionById(id),
  ])

  if (!transaction) notFound()

  const updateWithId = updateTransaction.bind(null, id)

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Sửa giao dịch</CardTitle>
      </CardHeader>
      <CardContent>
        <TransactionForm
          categories={categories}
          transaction={transaction}
          action={updateWithId}
        />
      </CardContent>
    </Card>
  )
}
