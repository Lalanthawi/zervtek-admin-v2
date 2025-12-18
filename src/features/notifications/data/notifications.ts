import { faker } from '@faker-js/faker'

faker.seed(11111)

export type NotificationType =
  | 'inspection_request'
  | 'translation_request'
  | 'bid_placed'
  | 'payment_received'
  | 'task_assigned'
  | 'task_completed'
  | 'system_alert'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  read: boolean
  createdAt: Date
  // Optional link to related item
  link?: string
  // Role-based visibility
  visibleTo: ('superadmin' | 'admin' | 'manager' | 'cashier')[]
  // Metadata for filtering
  metadata?: {
    customerId?: string
    customerName?: string
    vehicleId?: string
    vehicleName?: string
    amount?: number
    requestId?: string
  }
}

// Notification type configurations
export const notificationTypeConfig: Record<
  NotificationType,
  {
    label: string
    icon: string
    color: string
    roles: ('superadmin' | 'admin' | 'manager' | 'cashier')[]
  }
> = {
  inspection_request: {
    label: 'Inspection Request',
    icon: 'ClipboardCheck',
    color: 'blue',
    roles: ['superadmin', 'admin', 'manager'],
  },
  translation_request: {
    label: 'Translation Request',
    icon: 'Languages',
    color: 'violet',
    roles: ['superadmin', 'admin', 'manager'],
  },
  bid_placed: {
    label: 'Bid Placed',
    icon: 'Gavel',
    color: 'amber',
    roles: ['superadmin', 'admin', 'manager'],
  },
  payment_received: {
    label: 'Payment Received',
    icon: 'CreditCard',
    color: 'emerald',
    roles: ['superadmin', 'admin', 'manager', 'cashier'],
  },
  task_assigned: {
    label: 'Task Assigned',
    icon: 'UserPlus',
    color: 'indigo',
    roles: ['superadmin', 'admin', 'manager', 'cashier'],
  },
  task_completed: {
    label: 'Task Completed',
    icon: 'CheckCircle',
    color: 'green',
    roles: ['superadmin', 'admin', 'manager'],
  },
  system_alert: {
    label: 'System Alert',
    icon: 'AlertTriangle',
    color: 'red',
    roles: ['superadmin', 'admin'],
  },
}

// Generate mock notifications
const notificationTemplates: {
  type: NotificationType
  titles: string[]
  messages: string[]
}[] = [
  {
    type: 'inspection_request',
    titles: [
      'New Inspection Request',
      'Inspection Requested',
      'Vehicle Inspection Needed',
    ],
    messages: [
      'requested a pre-purchase inspection for',
      'wants a full inspection on',
      'submitted an inspection request for',
    ],
  },
  {
    type: 'translation_request',
    titles: [
      'New Translation Request',
      'Translation Needed',
      'Document Translation Request',
    ],
    messages: [
      'requested auction sheet translation for',
      'needs export certificate translated for',
      'submitted a translation request for',
    ],
  },
  {
    type: 'bid_placed',
    titles: ['New Bid Placed', 'Bid Submitted', 'Auction Bid Received'],
    messages: [
      'placed a bid on',
      'submitted a new bid for',
      'is bidding on',
    ],
  },
  {
    type: 'payment_received',
    titles: [
      'Payment Received',
      'Payment Confirmed',
      'Funds Received',
    ],
    messages: [
      'completed payment for',
      'payment confirmed for',
      'transferred funds for',
    ],
  },
  {
    type: 'task_assigned',
    titles: ['Task Assigned to You', 'New Assignment', 'You Have a New Task'],
    messages: [
      'You have been assigned to handle',
      'A new task has been assigned:',
      'Please review and complete:',
    ],
  },
  {
    type: 'task_completed',
    titles: ['Task Completed', 'Work Finished', 'Assignment Done'],
    messages: [
      'completed the inspection for',
      'finished translating documents for',
      'marked as complete:',
    ],
  },
  {
    type: 'system_alert',
    titles: ['System Alert', 'Important Notice', 'Action Required'],
    messages: [
      'System maintenance scheduled for tonight',
      'Please update your security settings',
      'New feature available: Check out the latest updates',
    ],
  },
]

const vehicleNames = [
  '2023 Toyota Land Cruiser',
  '2022 Nissan Patrol',
  '2024 Mercedes G-Class',
  '2023 BMW X5',
  '2022 Lexus LX570',
  '2023 Range Rover Sport',
  '2024 Porsche Cayenne',
  '2023 Audi Q7',
]

export const notifications: Notification[] = Array.from(
  { length: 50 },
  (_, index) => {
    const template = faker.helpers.arrayElement(notificationTemplates)
    const config = notificationTypeConfig[template.type]
    const customerName = faker.person.fullName()
    const vehicleName = faker.helpers.arrayElement(vehicleNames)
    const title = faker.helpers.arrayElement(template.titles)
    const messageTemplate = faker.helpers.arrayElement(template.messages)

    let message: string
    if (template.type === 'system_alert') {
      message = messageTemplate
    } else if (template.type === 'task_assigned') {
      message = `${messageTemplate} ${vehicleName}`
    } else {
      message = `${customerName} ${messageTemplate} ${vehicleName}`
    }

    const createdAt = faker.date.recent({ days: 7 })

    return {
      id: faker.string.uuid(),
      type: template.type,
      title,
      message,
      priority: faker.helpers.arrayElement([
        'low',
        'normal',
        'normal',
        'high',
        'urgent',
      ] as NotificationPriority[]),
      read: index > 5 ? faker.datatype.boolean() : false, // First 5 are unread
      createdAt,
      link: template.type !== 'system_alert' ? `/${template.type.split('_')[0]}s` : undefined,
      visibleTo: config.roles,
      metadata: {
        customerId: faker.string.uuid(),
        customerName,
        vehicleName,
        amount:
          template.type === 'payment_received'
            ? faker.number.int({ min: 1000, max: 50000 })
            : undefined,
        requestId: `REQ-${faker.string.alphanumeric(6).toUpperCase()}`,
      },
    }
  }
).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

// Helper to get unread count
export const getUnreadCount = (
  role: 'superadmin' | 'admin' | 'manager' | 'cashier'
): number => {
  return notifications.filter(
    (n) => !n.read && n.visibleTo.includes(role)
  ).length
}

// Helper to get notifications for a role
export const getNotificationsForRole = (
  role: 'superadmin' | 'admin' | 'manager' | 'cashier'
): Notification[] => {
  return notifications.filter((n) => n.visibleTo.includes(role))
}
