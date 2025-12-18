'use client'

import { cn } from '@/lib/utils'

interface CardSkeletonProps {
  className?: string
  showImage?: boolean
  showBadge?: boolean
  lines?: number
}

export function CardSkeleton({
  className,
  showImage = true,
  showBadge = true,
  lines = 3,
}: CardSkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-4 space-y-4',
        className
      )}
    >
      {/* Image placeholder */}
      {showImage && (
        <div className='aspect-video w-full rounded-lg bg-muted animate-pulse' />
      )}

      {/* Badge */}
      {showBadge && (
        <div className='h-5 w-16 rounded-full bg-muted animate-pulse' />
      )}

      {/* Text lines */}
      <div className='space-y-2'>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 rounded bg-muted animate-pulse',
              i === 0 && 'w-3/4',
              i === 1 && 'w-full',
              i > 1 && 'w-1/2'
            )}
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

interface CardGridSkeletonProps {
  count?: number
  columns?: 2 | 3 | 4
  className?: string
}

export function CardGridSkeleton({
  count = 6,
  columns = 3,
  className,
}: CardGridSkeletonProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

interface ListSkeletonProps {
  count?: number
  showAvatar?: boolean
  className?: string
}

export function ListSkeleton({
  count = 5,
  showAvatar = true,
  className,
}: ListSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className='flex items-center gap-3 p-3 rounded-lg border'
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {showAvatar && (
            <div className='h-10 w-10 rounded-full bg-muted animate-pulse flex-shrink-0' />
          )}
          <div className='flex-1 space-y-2'>
            <div className='h-4 w-1/3 rounded bg-muted animate-pulse' />
            <div className='h-3 w-2/3 rounded bg-muted/70 animate-pulse' />
          </div>
          <div className='h-5 w-16 rounded-full bg-muted animate-pulse' />
        </div>
      ))}
    </div>
  )
}
