"use client"

import { useState, type ChangeEvent } from "react"
import { Download, RefreshCw, Upload } from "lucide-react"
import { useLocalData, useSyncStatus } from "@/components/local-data-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { importLocalSnapshot } from "@/lib/local/repository"
import { syncNow } from "@/lib/local/sync"
import { EMPTY_SNAPSHOT, type LocalSnapshot } from "@/lib/local/types"

function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}

function csvEscape(value: unknown) {
  const text = value == null ? "" : String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export default function ExportSettingsPage() {
  const { snapshot } = useLocalData()
  const syncStatus = useSyncStatus()
  const [message, setMessage] = useState<string | null>(null)

  function exportJSON() {
    downloadFile(`chi-tieu-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ exportedAt: new Date().toISOString(), ...snapshot }, null, 2), "application/json")
  }

  function exportCSV() {
    const categoryMap = new Map(snapshot.categories.map((item) => [item.id, item.name]))
    const rows = snapshot.transactions.map((item) => [item.occurred_on, item.type === "income" ? "Thu nhập" : "Chi tiêu", item.category_id ? categoryMap.get(item.category_id) ?? "" : "", item.amount, item.note ?? ""])
    const csv = [["Ngày", "Loại", "Danh mục", "Số tiền", "Ghi chú"], ...rows].map((row) => row.map(csvEscape).join(",")).join("\n")
    downloadFile(`giao-dich-${new Date().toISOString().slice(0, 10)}.csv`, `\uFEFF${csv}`, "text/csv;charset=utf-8")
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as Partial<LocalSnapshot>
      const imported = {
        categories: Array.isArray(parsed.categories) ? parsed.categories : [],
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
        recurring_templates: Array.isArray(parsed.recurring_templates) ? parsed.recurring_templates : [],
        debts: Array.isArray(parsed.debts) ? parsed.debts : [],
        debt_payments: Array.isArray(parsed.debt_payments) ? parsed.debt_payments : [],
      } as LocalSnapshot
      await importLocalSnapshot({ ...EMPTY_SNAPSHOT, ...imported })
      setMessage("Đã nhập dữ liệu vào máy và đưa vào hàng đợi đồng bộ.")
    } catch {
      setMessage("File không hợp lệ hoặc không đọc được.")
    }
    event.target.value = ""
  }

  return <div className="mx-auto max-w-md space-y-6"><div><h1 className="text-xl font-semibold">Sao lưu &amp; đồng bộ</h1><p className="mt-1 text-sm text-muted-foreground">Dữ liệu chính nằm trên thiết bị; Supabase là bản đồng bộ từ xa.</p></div>
    <Card><CardHeader><CardTitle>Trạng thái đồng bộ</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-sm text-muted-foreground">{syncStatus.phase === "syncing" ? "Đang đồng bộ…" : syncStatus.phase === "offline" ? "Đang offline" : syncStatus.phase === "signed-out" ? "Chưa đăng nhập Supabase" : syncStatus.phase === "error" ? `Lỗi: ${syncStatus.error}` : syncStatus.lastSyncedAt ? `Lần cuối: ${new Date(syncStatus.lastSyncedAt).toLocaleString("vi-VN")}` : "Chưa đồng bộ trong phiên này"}{syncStatus.pending > 0 ? ` · ${syncStatus.pending} thay đổi đang chờ` : ""}</p><Button className="w-full" variant="outline" onClick={() => void syncNow()} disabled={syncStatus.phase === "syncing"}><RefreshCw className={syncStatus.phase === "syncing" ? "animate-spin" : ""} />Đồng bộ ngay</Button></CardContent></Card>
    <Card><CardHeader><CardTitle>Xuất dữ liệu local</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-sm text-muted-foreground">Tải bản sao đang hiển thị trên thiết bị, không cần chờ mạng.</p><div className="flex flex-wrap gap-2"><Button onClick={exportJSON}><Download />Xuất JSON</Button><Button variant="outline" onClick={exportCSV}>Xuất CSV</Button></div></CardContent></Card>
    <Card><CardHeader><CardTitle>Nhập dữ liệu</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-sm text-muted-foreground">Dữ liệu được thêm vào local trước rồi tự đồng bộ khi có mạng.</p>{message && <p className="rounded-md bg-muted p-2 text-sm">{message}</p>}<div className="space-y-1.5"><Label htmlFor="backup-file">File backup (.json)</Label><label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border bg-background text-sm font-medium hover:bg-muted" htmlFor="backup-file"><Upload className="size-4" />Chọn file JSON</label><input id="backup-file" type="file" accept="application/json" className="sr-only" onChange={handleImport} /></div></CardContent></Card>
  </div>
}
