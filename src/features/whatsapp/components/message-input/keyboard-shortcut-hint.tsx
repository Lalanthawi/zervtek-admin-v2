'use client'

import { cn } from '@/lib/utils'
import type { ReplyMode } from '../../types'

interface KeyboardShortcutHintProps {
  replyMode: ReplyMode
  className?: string
}

export function KeyboardShortcutHint({ replyMode, className }: KeyboardShortcutHintProps) {
  return (
    <div className={cn('flex items-center gap-3 text-[10px] text-muted-foreground', className)}>
      {replyMode === 'reply' ? (
        <>
          <span>
            <kbd className='rounded border bg-muted px-1'>Enter</kbd> to send
          </span>
          <span>
            <kbd className='rounded border bg-muted px-1'>Ctrl</kbd>+
            <kbd className='rounded border bg-muted px-1'>Enter</kbd> to send & archive
          </span>
        </>
      ) : (
        <>
          <span>
            <kbd className='rounded border bg-muted px-1'>Enter</kbd> to send & archive
          </span>
          <span>
            <kbd className='rounded border bg-muted px-1'>Ctrl</kbd>+
            <kbd className='rounded border bg-muted px-1'>Enter</kbd> to send only
          </span>
        </>
      )}
      <span>
        <kbd className='rounded border bg-muted px-1'>Shift</kbd>+
        <kbd className='rounded border bg-muted px-1'>Enter</kbd> for new line
      </span>
    </div>
  )
}

interface KeyboardShortcutsLegendProps {
  className?: string
}

export function KeyboardShortcutsLegend({ className }: KeyboardShortcutsLegendProps) {
  const shortcuts = [
    { key: 'E', description: 'Archive conversation' },
    { key: 'U', description: 'Mark as unread' },
    { key: 'L', description: 'Open labels' },
    { key: 'Z', description: 'Snooze' },
    { key: '@', description: 'Mention team member' },
    { key: 'N', description: 'New conversation' },
    { key: '/', description: 'Search' },
    { key: '↑↓', description: 'Navigate conversations' },
  ]

  return (
    <div className={cn('space-y-2 text-xs', className)}>
      <p className='font-medium text-muted-foreground'>Keyboard shortcuts</p>
      <div className='grid grid-cols-2 gap-2'>
        {shortcuts.map(({ key, description }) => (
          <div key={key} className='flex items-center gap-2'>
            <kbd className='flex h-5 min-w-[20px] items-center justify-center rounded border bg-muted px-1 text-[10px] font-medium'>
              {key}
            </kbd>
            <span className='text-muted-foreground'>{description}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
