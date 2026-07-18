"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
      className="flex flex-wrap items-end gap-3 rounded-lg border p-3"
    >
      <div className="w-40 space-y-1.5">
        <Label htmlFor="from">Từ ngày</Label>
        <Input id="from" name="from" type="date" defaultValue={defaultValues.from} />
      </div>

      <div className="w-40 space-y-1.5">
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
