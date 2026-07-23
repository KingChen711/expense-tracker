"use client"

import { RecurringForm } from "@/components/recurring/recurring-form"
import { useLocalData } from "@/components/local-data-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewRecurringPage() {
  const { snapshot } = useLocalData()
  return <Card className="mx-auto max-w-md"><CardHeader><CardTitle>Thêm giao dịch định kỳ</CardTitle></CardHeader><CardContent><RecurringForm categories={snapshot.categories} /></CardContent></Card>
}
