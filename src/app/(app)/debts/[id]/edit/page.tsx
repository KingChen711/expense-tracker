"use client"

import { useParams } from "next/navigation"
import { DebtForm } from "@/components/debts/debt-form"
import { useLocalData } from "@/components/local-data-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EditDebtPage() {
  const { id } = useParams<{ id: string }>()
  const { snapshot, loading } = useLocalData()
  const debt = snapshot.debts.find((item) => item.id === id)
  if (loading) return <p className="text-sm text-muted-foreground">Đang mở dữ liệu trên máy…</p>
  if (!debt) return <p className="text-sm text-muted-foreground">Không tìm thấy khoản nợ.</p>
  return <Card className="mx-auto max-w-md"><CardHeader><CardTitle>Sửa khoản nợ</CardTitle></CardHeader><CardContent><DebtForm debt={debt} /></CardContent></Card>
}
