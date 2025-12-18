'use client'

import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { NotificationBell } from '@/features/notifications/components/notification-bell'

export function HeaderActions() {
  return (
    <div className='ms-auto flex items-center space-x-4'>
      <NotificationBell />
      <ThemeSwitch />
      <ProfileDropdown />
    </div>
  )
}
