"use client"

import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"
import { Button, type buttonVariants } from "@/components/ui/button"
import type { VariantProps } from "class-variance-authority"

interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  pendingText?: string
}

export function SubmitButton({
  children,
  pendingText,
  variant,
  size,
  className,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      disabled={pending || props.disabled}
      {...props}
    >
      {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
      {pending && pendingText ? pendingText : children}
    </Button>
  )
}
