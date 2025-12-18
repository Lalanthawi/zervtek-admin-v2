import { Suspense } from 'react'
import { Notifications } from '@/features/notifications'

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Notifications />
    </Suspense>
  )
}
