import * as React from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, title, description, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("border border-red-400 bg-red-50 p-4 rounded-md", className)}
        {...props}
      >
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-1" />
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
  return <p className="text-sm text-red-700">{children}</p>
}

