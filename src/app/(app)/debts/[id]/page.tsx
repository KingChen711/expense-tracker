"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useLocalData } from "@/components/local-data-provider"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { addDebtPayment, removeDebt, removeDebtPayment } from "@/lib/local/repository"
import { formatVND } from "@/lib/format"
import { cn } from "@/lib/utils"

function todayISO() { return new Date().toISOString().slice(0, 10) }

export default function DebtDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { snapshot, loading } = useLocalData()
  const [saving, setSaving] = useState(false)
  const debt = snapshot.debts.find((item) => item.id === id)
  const payments = snapshot.debt_payments.filter((item) => item.debt_id === id).sort((a, b) => b.paid_on.localeCompare(a.paid_on))
  if (loading) return <p className="text-sm text-muted-foreground">Đang mở dữ liệu trên máy…</p>
  if (!debt) return <p className="text-sm text-muted-foreground">Không tìm thấy khoản nợ.</p>
  const totalPaid = payments.reduce((sum, item) => sum + item.amount, 0)
  const remaining = debt.total_amount - totalPaid
  const percent = debt.total_amount > 0 ? Math.min(100, Math.round((totalPaid / debt.total_amount) * 100)) : 0
  async function handlePayment(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; setSaving(true); const formData = new FormData(form); await addDebtPayment({ debt_id: id, amount: Number(formData.get("amount")), paid_on: String(formData.get("paid_on")), note: String(formData.get("note") || "").trim() || null }); setSaving(false); form.reset() }
  async function handleDelete() { await removeDebt(id); router.push("/debts") }
  return <div className="mx-auto max-w-md space-y-6"><Card><CardHeader><div className="flex items-center justify-between"><CardTitle>{debt.creditor_name}</CardTitle><div className="flex gap-2"><Link href={`/debts/${id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>Sửa</Link><Button variant="destructive" size="sm" onClick={handleDelete}>Xóa</Button></div></div></CardHeader><CardContent className="space-y-3">{debt.due_date && <p className="text-sm text-muted-foreground">Hạn trả: {debt.due_date}</p>}{debt.note && <p className="text-sm text-muted-foreground">{debt.note}</p>}<div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} /></div><p className="font-tabular text-sm">Đã trả {formatVND(totalPaid)} / {formatVND(debt.total_amount)}</p><p className={cn("font-tabular text-lg font-semibold", remaining > 0 ? "text-destructive" : "text-primary")}>{remaining > 0 ? `Còn nợ ${formatVND(remaining)}` : "Đã trả xong"}</p></CardContent></Card>
    {remaining > 0 && <Card><CardHeader><CardTitle>Ghi nhận trả nợ</CardTitle></CardHeader><CardContent><form onSubmit={handlePayment} className="space-y-4"><div className="space-y-2"><Label htmlFor="amount">Số tiền trả (đ)</Label><Input id="amount" name="amount" type="number" min="0" step="1000" max={remaining} required /></div><div className="space-y-2"><Label htmlFor="paid_on">Ngày trả</Label><Input id="paid_on" name="paid_on" type="date" required defaultValue={todayISO()} /></div><div className="space-y-2"><Label htmlFor="note">Ghi chú</Label><Input id="note" name="note" placeholder="Không bắt buộc" /></div><Button type="submit" className="w-full" disabled={saving}>{saving ? "Đang lưu…" : "Ghi nhận"}</Button></form></CardContent></Card>}
    <div className="space-y-2"><h2 className="text-sm font-medium text-muted-foreground">Lịch sử trả nợ</h2>{payments.length === 0 ? <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">Chưa có lần trả nào.</div> : <ul className="divide-y rounded-xl border bg-card">{payments.map((payment) => <li key={payment.id} className="flex items-center justify-between gap-4 p-3"><div><p className="font-tabular font-medium">{formatVND(payment.amount)}</p><p className="text-xs text-muted-foreground">{payment.paid_on}{payment.note ? ` · ${payment.note}` : ""}</p></div><Button variant="destructive" size="sm" onClick={() => void removeDebtPayment(payment.id, id)}>Xóa</Button></li>)}</ul>}</div></div>
}
