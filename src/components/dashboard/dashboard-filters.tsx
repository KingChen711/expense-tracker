"use client"

import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function DashboardFilters({
  defaultValues,
  hasFilters,
}: {
  defaultValues: { from?: string; to?: string }
  hasFilters: boolean
}) {
  return (
    <form
      action="/dashboard"
      method="GET"
      className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-3 sm:p-4"
    >
      <div className="min-w-36 flex-1 space-y-1.5 sm:flex-none">
        <Label htmlFor="from">Từ ngày</Label>
        <Input id="from" name="from" type="date" defaultValue={defaultValues.from} />
      </div>

      <div className="min-w-36 flex-1 space-y-1.5 sm:flex-none">
        <Label htmlFor="to">Đến ngày</Label>
        <Input id="to" name="to" type="date" defaultValue={defaultValues.to} />
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit">Lọc</Button>
        {hasFilters && (
          <Link href="/dashboard" className="text-sm text-muted-foreground underline">
            Xoá lọc
          </Link>
        )}
      </div>
    </form>
  )
}
