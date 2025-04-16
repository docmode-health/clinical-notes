import * as React from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, title, description, variant = 'default', ...props }, ref) => {
    const baseStyle = "border p-4 rounded-md"
    const variantStyle = variant === 'destructive'
      ? "border-red-400 bg-red-50 text-red-700"
      : "border-gray-200 bg-gray-50 text-gray-900"

    return (
      <div
        ref={ref}
        className={cn(baseStyle, variantStyle, className)}
        {...props}
      >
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 mt-1" />
          <div>
            {title && <AlertTitle>{title}</AlertTitle>}
            {description && <AlertDescription>{description}</AlertDescription>}
          </div>
        </div>
      </div>
    )
  }
)
Alert.displayName = "Alert"

export function AlertTitle({ children }: { children: React.ReactNode }) {
  return <h5 className="font-semibold">{children}</h5>
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm">{children}</p>
}

