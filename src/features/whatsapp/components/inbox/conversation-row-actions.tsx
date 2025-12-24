'use client'

import { ReactNode } from 'react'
import {
  Archive,
  ArchiveRestore,
  Bell,
  Clock,
  Eye,
  Tag,
  UserPlus,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { EnhancedChat } from '../../types'

interface ConversationRowActionsProps {
  chat: EnhancedChat
  children: ReactNode
  onArchive?: () => void
  onUnarchive?: () => void
  onSnooze?: () => void
  onLabel?: () => void
  onAssign?: () => void
  onMarkUnread?: () => void
}

export function ConversationRowActions({
  chat,
  children,
  onArchive,
  onUnarchive,
  onSnooze,
  onLabel,
  onAssign,
  onMarkUnread,
}: ConversationRowActionsProps) {
  const isArchived = chat.status === 'archived'
  const isSnoozed = chat.status === 'snoozed'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        {/* Label */}
        {onLabel && (
          <DropdownMenuItem onClick={onLabel}>
            <Tag className='mr-2 h-4 w-4' />
            Add label
          </DropdownMenuItem>
        )}

        {/* Assign */}
        {onAssign && (
          <DropdownMenuItem onClick={onAssign}>
            <UserPlus className='mr-2 h-4 w-4' />
            {chat.assignment ? 'Reassign' : 'Assign to...'}
          </DropdownMenuItem>
        )}

        {/* Snooze */}
        {onSnooze && !isSnoozed && (
          <DropdownMenuItem onClick={onSnooze}>
            <Clock className='mr-2 h-4 w-4' />
            Snooze
          </DropdownMenuItem>
        )}

        {/* Cancel snooze */}
        {isSnoozed && onSnooze && (
          <DropdownMenuItem onClick={onSnooze}>
            <Bell className='mr-2 h-4 w-4' />
            Cancel snooze
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Mark unread */}
        {onMarkUnread && !chat.isUnread && (
          <DropdownMenuItem onClick={onMarkUnread}>
            <Eye className='mr-2 h-4 w-4' />
            Mark as unread
          </DropdownMenuItem>
        )}

        {/* Archive / Unarchive */}
        {isArchived ? (
          onUnarchive && (
            <DropdownMenuItem onClick={onUnarchive}>
              <ArchiveRestore className='mr-2 h-4 w-4' />
              Unarchive
            </DropdownMenuItem>
          )
        ) : (
          onArchive && (
            <DropdownMenuItem onClick={onArchive}>
              <Archive className='mr-2 h-4 w-4' />
              Archive
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
