'use client'

import { cn } from '@/lib/utils'

interface TableSkeletonProps {
  columns?: number
  rows?: number
  showHeader?: boolean
  className?: string
}

export function TableSkeleton({
  columns = 5,
  rows = 5,
  showHeader = true,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      {showHeader && (
        <div className='flex gap-4 px-4 py-3 border-b bg-muted/30'>
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={`header-${i}`}
              className='h-4 rounded bg-muted animate-pulse'
              style={{ width: `${Math.random() * 40 + 60}px` }}
            />
          ))}
        </div>
      )}

      {/* Rows */}
      <div className='divide-y'>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className='flex items-center gap-4 px-4 py-3'
            style={{ animationDelay: `${rowIndex * 50}ms` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={cn(
                  'h-4 rounded bg-muted/70 animate-pulse',
                  colIndex === 0 && 'w-8', // Checkbox column
                  colIndex === 1 && 'flex-1', // Main content
                  colIndex > 1 && 'w-20'
                )}
                style={{
                  animationDelay: `${(rowIndex * columns + colIndex) * 30}ms`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

interface TableRowSkeletonProps {
  columns?: number
  className?: string
}

export function TableRowSkeleton({
  columns = 5,
  className,
}: TableRowSkeletonProps) {
  return (
    <div className={cn('flex items-center gap-4 px-4 py-3', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 rounded bg-muted animate-pulse',
            i === 0 && 'w-8',
            i === 1 && 'flex-1',
            i > 1 && 'w-20'
          )}
        />
      ))}
    </div>
  )
}
