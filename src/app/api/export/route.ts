import { NextResponse, type NextRequest } from "next/server"
import { getExportData, transactionsToCSV } from "@/lib/data/export"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const format = request.nextUrl.searchParams.get("format") ?? "json"
  const data = await getExportData()
  const dateStamp = new Date().toISOString().slice(0, 10)

  if (format === "csv") {
    const csv = transactionsToCSV(data.transactions, data.categories)
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="giao-dich-${dateStamp}.csv"`,
      },
    })
  }

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="chi-tieu-backup-${dateStamp}.json"`,
    },
  })
}
