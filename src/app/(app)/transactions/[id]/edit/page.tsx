"use client"

import { useParams } from "next/navigation"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { useLocalData } from "@/components/local-data-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EditTransactionPage() {
  const { id } = useParams<{ id: string }>()
  const { snapshot, loading } = useLocalData()
  const record = snapshot.transactions.find((item) => item.id === id)
  if (loading) return <p className="text-sm text-muted-foreground">Đang mở dữ liệu trên máy…</p>
  if (!record) return <p className="text-sm text-muted-foreground">Không tìm thấy giao dịch.</p>
  const transaction = {
    ...record,
    category: snapshot.categories.find((category) => category.id === record.category_id) ?? null,
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader><CardTitle>Sửa giao dịch</CardTitle></CardHeader>
      <CardContent><TransactionForm categories={snapshot.categories} transaction={transaction} /></CardContent>
    </Card>
  )
}
