"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveDebt } from "@/lib/local/repository"
import type { DebtRecord } from "@/lib/local/types"

export function DebtForm({ debt }: { debt?: DebtRecord }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    const formData = new FormData(event.currentTarget)
    await saveDebt({
      id: debt?.id,
      creditor_name: String(formData.get("creditor_name")).trim(),
      total_amount: Number(formData.get("total_amount")),
      due_date: String(formData.get("due_date") || "") || null,
      note: String(formData.get("note") || "").trim() || null,
      status: debt?.status,
    })
    router.push("/debts")
  }
  return <form onSubmit={handleSubmit} className="space-y-4"><div className="space-y-2"><Label htmlFor="creditor_name">Nợ ai</Label><Input id="creditor_name" name="creditor_name" required defaultValue={debt?.creditor_name} /></div><div className="space-y-2"><Label htmlFor="total_amount">Tổng số tiền (đ)</Label><Input id="total_amount" name="total_amount" type="number" min="0" step="1000" required defaultValue={debt?.total_amount} /></div><div className="space-y-2"><Label htmlFor="due_date">Hạn trả (không bắt buộc)</Label><Input id="due_date" name="due_date" type="date" defaultValue={debt?.due_date ?? ""} /></div><div className="space-y-2"><Label htmlFor="note">Ghi chú</Label><Input id="note" name="note" defaultValue={debt?.note ?? ""} placeholder="Không bắt buộc" /></div><Button type="submit" className="w-full" disabled={saving}>{saving ? "Đang lưu…" : debt ? "Lưu thay đổi" : "Thêm khoản nợ"}</Button></form>
}
