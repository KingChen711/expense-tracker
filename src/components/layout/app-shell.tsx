"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeftRight,
  Download,
  Landmark,
  LayoutDashboard,
  Menu,
  Cloud,
  CloudOff,
  LoaderCircle,
  Plus,
  Repeat,
  Tags,
  Wallet,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { syncNow } from "@/lib/local/sync"
import { useSyncStatus } from "@/components/local-data-provider"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/transactions", label: "Giao dịch", icon: ArrowLeftRight },
  { href: "/categories", label: "Danh mục", icon: Tags },
  { href: "/budgets", label: "Ngân sách", icon: Wallet },
  { href: "/recurring", label: "Định kỳ", icon: Repeat },
  { href: "/debts", label: "Nợ", icon: Landmark },
  { href: "/settings/export", label: "Sao lưu", icon: Download },
]

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/icons/icon-192.png"
        alt=""
        width={28}
        height={28}
        className="size-7 rounded-lg"
      />
      <span className="text-lg font-bold tracking-tight">Chi tiêu</span>
    </div>
  )
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-accent text-primary"
                : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const syncStatus = useSyncStatus()

  async function handleSignOut() {
    await syncNow()
    await createClient().auth.signOut()
    window.location.href = "/login"
  }

  const SyncIcon = syncStatus.phase === "syncing"
    ? LoaderCircle
    : syncStatus.phase === "offline" || syncStatus.phase === "error"
      ? CloudOff
      : Cloud
  const syncLabel = syncStatus.phase === "syncing"
    ? "Đang đồng bộ"
    : syncStatus.pending > 0
      ? `${syncStatus.pending} thay đổi đang chờ`
      : syncStatus.lastSyncedAt
        ? "Đã đồng bộ"
        : "Dữ liệu trên máy"

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-56 shrink-0 flex-col border-r bg-card md:flex">
        <div className="px-4 py-5">
          <Brand />
        </div>
        <div className="flex flex-1 flex-col px-2">
          <NavLinks pathname={pathname} />
        </div>
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="mb-1 w-full justify-start text-muted-foreground" onClick={() => void syncNow()}>
            <SyncIcon className={cn("size-3.5", syncStatus.phase === "syncing" && "animate-spin")} />
            <span className="truncate">{syncLabel}</span>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>Đăng xuất</Button>
        </div>
      </aside>

      <header className="flex items-center justify-between border-b bg-card px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Mở menu"
          className="flex size-9 items-center justify-center rounded-md hover:bg-accent"
        >
          <Menu className="size-5" />
        </button>
        <Brand />
        <div className="size-9" />
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Đóng menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-card p-2 shadow-xl">
            <div className="flex items-center justify-between px-2 py-3">
              <Brand />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Đóng menu"
                className="flex size-8 items-center justify-center rounded-md hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </div>
            <NavLinks
              pathname={pathname}
              onNavigate={() => setDrawerOpen(false)}
            />
            <div className="mt-2 border-t p-2">
              <Button variant="ghost" size="sm" className="mb-1 w-full justify-start text-muted-foreground" onClick={() => void syncNow()}>
                <SyncIcon className={cn("size-3.5", syncStatus.phase === "syncing" && "animate-spin")} />
                {syncLabel}
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>Đăng xuất</Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 p-4 pb-24 md:p-8">
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>

      <nav
        aria-label="Điều hướng nhanh"
        className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border bg-card/95 p-1.5 shadow-lg backdrop-blur md:hidden"
      >
        {NAV_ITEMS.slice(0, 2).map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
        <Link
          href="/transactions/new"
          aria-label="Thêm giao dịch"
          className="-mt-5 flex justify-center"
        >
          <span className="flex size-14 items-center justify-center rounded-2xl border-4 border-background bg-primary text-primary-foreground shadow-md">
            <Plus className="size-6" />
          </span>
        </Link>
        {NAV_ITEMS.slice(3, 5).map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
