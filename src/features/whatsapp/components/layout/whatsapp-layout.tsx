'use client'

import { useEffect, useRef } from 'react'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

interface WhatsAppLayoutProps {
  children: React.ReactNode
  className?: string
}

export function WhatsAppLayout({ children, className }: WhatsAppLayoutProps) {
  const { setOpen, open } = useSidebar()
  const previousOpenState = useRef<boolean | null>(null)
  const hasCollapsed = useRef(false)

  useEffect(() => {
    // Only run once on mount
    if (hasCollapsed.current) return

    // Store the current sidebar state before collapsing
    previousOpenState.current = open

    // Collapse sidebar when entering WhatsApp
    setOpen(false)
    hasCollapsed.current = true

    // Restore sidebar state when leaving WhatsApp
    return () => {
      if (previousOpenState.current !== null) {
        setOpen(previousOpenState.current)
      }
    }
  }, []) // Empty deps - only run on mount/unmount

  return (
    <div
      className={cn(
        'flex h-screen w-full overflow-hidden bg-[#EFEAE2] dark:bg-[#0B141A]',
        className
      )}
    >
      {children}
    </div>
  )
}
