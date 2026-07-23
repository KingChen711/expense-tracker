"use client"

import { TransactionForm } from "@/components/transactions/transaction-form"
import { useLocalData } from "@/components/local-data-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewTransactionPage() {
  const { snapshot } = useLocalData()
  const recentCategoryIds = Array.from(
    new Set(
      [...snapshot.transactions]
        .sort((a, b) => b.occurred_on.localeCompare(a.occurred_on))
        .map((item) => item.category_id)
        .filter((id): id is string => Boolean(id))
    )
  ).slice(0, 6)

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Thêm giao dịch</CardTitle>
        <p className="text-sm text-muted-foreground">Giao dịch được lưu ngay trên thiết bị.</p>
      </CardHeader>
      <CardContent>
        <TransactionForm categories={snapshot.categories} recentCategoryIds={recentCategoryIds} />
      </CardContent>
    </Card>
  )
}
