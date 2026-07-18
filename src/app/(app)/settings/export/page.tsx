import { importData } from "@/lib/actions/import"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { SubmitButton } from "@/components/ui/submit-button"

export default async function ExportSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string; error?: string }>
}) {
  const { imported, error } = await searchParams

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-xl font-semibold">Sao lưu &amp; khôi phục</h1>

      <Card>
        <CardHeader>
          <CardTitle>Xuất dữ liệu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Tải toàn bộ dữ liệu về máy để lưu trữ hoặc khôi phục sau này.
          </p>
          <div className="flex flex-wrap gap-2">
            <a href="/api/export?format=json" className={buttonVariants()}>
              Xuất JSON (backup đầy đủ)
            </a>
            <a
              href="/api/export?format=csv"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Xuất CSV (giao dịch)
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nhập lại dữ liệu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Chọn file JSON đã xuất trước đó để khôi phục. Dữ liệu sẽ được
            thêm vào (không xoá dữ liệu hiện có).
          </p>
          {imported && (
            <p className="rounded-md bg-primary/10 p-2 text-sm text-primary">
              Đã nhập: {imported}
            </p>
          )}
          {error && (
            <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <form action={importData} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="file">File backup (.json)</Label>
              <input
                id="file"
                name="file"
                type="file"
                accept="application/json"
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent text-sm file:mr-3 file:h-full file:border-0 file:bg-secondary file:px-3 file:text-secondary-foreground"
              />
            </div>
            <SubmitButton className="w-full">
              Nhập dữ liệu
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
