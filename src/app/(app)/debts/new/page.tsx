import { DebtForm } from "@/components/debts/debt-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewDebtPage() {
  return <Card className="mx-auto max-w-md"><CardHeader><CardTitle>Thêm khoản nợ</CardTitle></CardHeader><CardContent><DebtForm /></CardContent></Card>
}
