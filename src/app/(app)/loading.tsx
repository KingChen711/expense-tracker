import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Đang tải dữ liệu...</p>
      </div>
    </div>
  )
}
