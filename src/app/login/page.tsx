"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    void createClient().auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard")
    })
  }, [router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    const formData = new FormData(event.currentTarget)
    const { error: signInError } = await createClient().auth.signInWithPassword({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    })
    if (signInError) {
      setError(signInError.message)
      setSubmitting(false)
      return
    }
    router.replace("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Đăng nhập để đồng bộ</CardTitle>
          <p className="text-sm text-muted-foreground">Dữ liệu trên máy vẫn dùng được khi dịch vụ chưa sẵn sàng.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Đang đăng nhập…" : "Đăng nhập"}
            </Button>
            <Link href="/dashboard" className="block text-center text-sm text-muted-foreground hover:text-foreground">
              Tiếp tục với dữ liệu trên máy
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
