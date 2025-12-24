import type {
  WhatsAppInstance,
  Contact,
  Message,
  Chat,
  MessageTemplate,
  BroadcastList,
  BroadcastMessage,
  WhatsAppStats,
  ConversationLabel,
  StaffMember,
  StaffGroup,
  InternalNote,
  EnhancedChat,
  StaffPerformance,
  UserPreferences,
} from '../types'

// Mock WhatsApp Instance
export const mockInstance: WhatsAppInstance = {
  instanceName: 'zervtek-main',
  instanceId: 'inst_abc123',
  status: 'open',
  owner: 'Zervtek Admin',
  profileName: 'Zervtek',
  profilePicUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=ZA',
  number: '+81123456789',
  integration: 'WHATSAPP-BAILEYS',
  token: 'tok_xxx',
  webhookUrl: 'https://api.zervtek.com/webhook/whatsapp',
  webhookEvents: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'QRCODE_UPDATED'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date(),
}

// Mock Contacts
export const mockContacts: Contact[] = [
  {
    id: '81901234567@s.whatsapp.net',
    pushName: 'Takeshi Yamamoto',
    profilePicUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Takeshi',
    number: '+81901234567',
    isGroup: false,
    isMyContact: true,
    isBusiness: false,
    lastMessageAt: new Date('2024-01-20T10:30:00'),
    unreadCount: 2,
  },
  {
    id: '81801234567@s.whatsapp.net',
    pushName: 'Yuki Motors Ltd',
    profilePicUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=YM',
    number: '+81801234567',
    isGroup: false,
    isMyContact: true,
    isBusiness: true,
    lastMessageAt: new Date('2024-01-20T09:15:00'),
    unreadCount: 0,
  },
  {
    id: '81701234567@s.whatsapp.net',
    pushName: 'Kenji Tanaka',
    profilePicUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji',
    number: '+81701234567',
    isGroup: false,
    isMyContact: true,
    isBusiness: false,
    lastMessageAt: new Date('2024-01-19T16:45:00'),
    unreadCount: 0,
  },
  {
    id: '81601234567@s.whatsapp.net',
    pushName: 'Maria Santos',
    profilePicUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    number: '+81601234567',
    isGroup: false,
    isMyContact: true,
    isBusiness: false,
    lastMessageAt: new Date('2024-01-19T14:20:00'),
    unreadCount: 1,
  },
  {
    id: '81501234567@s.whatsapp.net',
    pushName: 'Ahmed Hassan',
    profilePicUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
    number: '+81501234567',
    isGroup: false,
    isMyContact: true,
    isBusiness: false,
    lastMessageAt: new Date('2024-01-18T11:00:00'),
    unreadCount: 0,
  },
  {
    id: '120363123456789@g.us',
    pushName: 'VIP Buyers Group',
    profilePicUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=VIP',
    number: '',
    isGroup: true,
    isMyContact: false,
    isBusiness: false,
    lastMessageAt: new Date('2024-01-20T08:00:00'),
    unreadCount: 5,
  },
]

// Mock Messages
const generateMessages = (contactId: string, contactName: string): Message[] => {
  const baseTime = Date.now() - 86400000 // 24 hours ago
  return [
    {
      id: `msg_${contactId}_1`,
      key: { remoteJid: contactId, fromMe: false, id: 'abc1' },
      pushName: contactName,
      message: { conversation: 'Hello! I\'m interested in the Toyota Land Cruiser from the latest auction.' },
      messageType: 'text',
      messageTimestamp: baseTime,
      status: 'read',
    },
    {
      id: `msg_${contactId}_2`,
      key: { remoteJid: contactId, fromMe: true, id: 'abc2' },
      message: { conversation: 'Hi! Thank you for your interest. The Land Cruiser is still available. Current bid is $45,000.' },
      messageType: 'text',
      messageTimestamp: baseTime + 300000,
      status: 'read',
    },
    {
      id: `msg_${contactId}_3`,
      key: { remoteJid: contactId, fromMe: false, id: 'abc3' },
      pushName: contactName,
      message: { conversation: 'That sounds good. Can you send me more photos?' },
      messageType: 'text',
      messageTimestamp: baseTime + 600000,
      status: 'read',
    },
    {
      id: `msg_${contactId}_4`,
      key: { remoteJid: contactId, fromMe: true, id: 'abc4' },
      message: {
        imageMessage: {
          url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800',
          caption: 'Here are the photos of the Land Cruiser. Let me know if you need more details!',
          mimetype: 'image/jpeg',
        },
      },
      messageType: 'image',
      messageTimestamp: baseTime + 900000,
      status: 'delivered',
    },
    {
      id: `msg_${contactId}_5`,
      key: { remoteJid: contactId, fromMe: false, id: 'abc5' },
      pushName: contactName,
      message: { conversation: 'Perfect! I\'d like to place a bid of $47,000. How do I proceed?' },
      messageType: 'text',
      messageTimestamp: baseTime + 3600000,
      status: 'read',
    },
  ]
}

// Mock Chats
export const mockChats: Chat[] = mockContacts.map((contact) => ({
  id: contact.id,
  contact,
  messages: generateMessages(contact.id, contact.pushName),
  lastMessage: generateMessages(contact.id, contact.pushName).slice(-1)[0],
  unreadCount: contact.unreadCount,
  pinned: contact.pushName === 'VIP Buyers Group',
  muted: false,
  archived: false,
}))

// Mock Message Templates
export const mockTemplates: MessageTemplate[] = [
  {
    id: 'tmpl_1',
    name: 'Auction Winner Notification',
    category: 'utility',
    content: 'Congratulations {{name}}! You\'ve won the auction for {{vehicle}}. Final price: {{price}}. Please complete payment within 48 hours. Contact us for shipping details.',
    variables: ['name', 'vehicle', 'price'],
    status: 'active',
    usageCount: 156,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'tmpl_2',
    name: 'Outbid Alert',
    category: 'utility',
    content: 'Hi {{name}}, you\'ve been outbid on {{vehicle}}. Current highest bid: {{currentBid}}. Auction ends: {{endTime}}. Place a new bid now!',
    variables: ['name', 'vehicle', 'currentBid', 'endTime'],
    status: 'active',
    usageCount: 342,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'tmpl_3',
    name: 'New Auction Announcement',
    category: 'marketing',
    content: 'New arrivals! Check out our latest auction: {{vehicle}} starting at {{startingBid}}. Auction starts: {{startTime}}. Don\'t miss out!',
    variables: ['vehicle', 'startingBid', 'startTime'],
    status: 'active',
    usageCount: 89,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: 'tmpl_4',
    name: 'Payment Reminder',
    category: 'utility',
    content: 'Reminder: Payment for {{vehicle}} (Invoice #{{invoiceId}}) is due in {{daysLeft}} days. Amount: {{amount}}. Please complete payment to avoid cancellation.',
    variables: ['vehicle', 'invoiceId', 'daysLeft', 'amount'],
    status: 'active',
    usageCount: 67,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: 'tmpl_5',
    name: 'Shipping Update',
    category: 'service',
    content: 'Shipping update for {{vehicle}}: Status - {{status}}. Estimated arrival: {{eta}}. Tracking: {{trackingUrl}}',
    variables: ['vehicle', 'status', 'eta', 'trackingUrl'],
    status: 'active',
    usageCount: 234,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-19'),
  },
  {
    id: 'tmpl_6',
    name: 'Welcome Message',
    category: 'marketing',
    content: 'Welcome to Zervtek Auctions, {{name}}! We specialize in premium Japanese vehicles. Browse our current auctions at zervtek.com. Need help? Reply to this message!',
    variables: ['name'],
    status: 'active',
    usageCount: 412,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
]

// Mock Broadcast Lists
export const mockBroadcastLists: BroadcastList[] = [
  {
    id: 'blist_1',
    name: 'VIP Customers',
    contacts: mockContacts.filter((c) => !c.isGroup).slice(0, 3),
    description: 'High-value customers with purchase history > $100k',
    createdAt: new Date('2024-01-05'),
  },
  {
    id: 'blist_2',
    name: 'Newsletter Subscribers',
    contacts: mockContacts.filter((c) => !c.isGroup),
    description: 'All newsletter subscribers',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 'blist_3',
    name: 'Active Bidders',
    contacts: mockContacts.filter((c) => !c.isGroup).slice(0, 4),
    description: 'Customers with active bids',
    createdAt: new Date('2024-01-15'),
  },
]

// Mock Broadcast Messages
export const mockBroadcasts: BroadcastMessage[] = [
  {
    id: 'bc_1',
    listId: 'blist_2',
    listName: 'Newsletter Subscribers',
    template: mockTemplates[2],
    content: 'New arrivals! Check out our latest auction: 2023 Toyota Land Cruiser starting at $40,000. Auction starts: Jan 25, 2024. Don\'t miss out!',
    totalRecipients: 5,
    sent: 5,
    delivered: 4,
    read: 3,
    failed: 0,
    status: 'completed',
    sentAt: new Date('2024-01-20T09:00:00'),
    completedAt: new Date('2024-01-20T09:05:00'),
  },
  {
    id: 'bc_2',
    listId: 'blist_1',
    listName: 'VIP Customers',
    content: 'Exclusive preview: Rare JDM collection arriving next week. Early access for VIP members only!',
    totalRecipients: 3,
    sent: 3,
    delivered: 3,
    read: 2,
    failed: 0,
    status: 'completed',
    sentAt: new Date('2024-01-18T14:00:00'),
    completedAt: new Date('2024-01-18T14:02:00'),
  },
  {
    id: 'bc_3',
    listId: 'blist_3',
    listName: 'Active Bidders',
    template: mockTemplates[1],
    content: 'Auction ending soon! Multiple vehicles closing in the next 2 hours. Check your bids now!',
    totalRecipients: 4,
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 3600000), // 1 hour from now
  },
]

// Mock Stats
export const mockStats: WhatsAppStats = {
  totalContacts: 1247,
  totalChats: 856,
  messagesSent: 4523,
  messagesReceived: 3891,
  messagesDelivered: 4412,
  messagesRead: 3967,
  activeChats: 42,
  broadcastsSent: 28,
  templatesUsed: 1245,
  avgResponseTime: 12, // minutes
}

// Helper to generate stats with random changes
export function generateMockStats(): WhatsAppStats {
  return {
    ...mockStats,
    messagesSent: mockStats.messagesSent + Math.floor(Math.random() * 50),
    messagesReceived: mockStats.messagesReceived + Math.floor(Math.random() * 40),
    activeChats: mockStats.activeChats + Math.floor(Math.random() * 10) - 5,
  }
}

// ============ Labels ============
export const mockLabels: ConversationLabel[] = [
  {
    id: 'label_1',
    name: 'Lead',
    color: 'red',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'label_2',
    name: 'Support',
    color: 'blue',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'label_3',
    name: 'VIP',
    color: 'amber',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'label_4',
    name: 'Follow-up',
    color: 'green',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'label_5',
    name: 'Urgent',
    color: 'orange',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
]

// ============ Staff Members ============
export const mockStaffMembers: StaffMember[] = [
  {
    id: 'staff_1',
    firstName: 'Sarah',
    lastName: 'Miller',
    email: 'sarah.miller@zervtek.com',
    role: 'sales_staff',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    isOnline: true,
  },
  {
    id: 'staff_2',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@zervtek.com',
    role: 'support_staff',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    isOnline: true,
  },
  {
    id: 'staff_3',
    firstName: 'Jessica',
    lastName: 'Chen',
    email: 'jessica.chen@zervtek.com',
    role: 'manager',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    isOnline: false,
  },
  {
    id: 'staff_4',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@zervtek.com',
    role: 'admin',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    isOnline: true,
  },
  {
    id: 'staff_5',
    firstName: 'Emily',
    lastName: 'Brown',
    email: 'emily.brown@zervtek.com',
    role: 'sales_staff',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    isOnline: false,
  },
]

// ============ Staff Groups ============
export const mockStaffGroups: StaffGroup[] = [
  {
    id: 'group_1',
    name: 'Sales Team',
    description: 'All sales staff members',
    members: mockStaffMembers.filter((s) => s.role === 'sales_staff'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'group_2',
    name: 'Support Team',
    description: 'Customer support staff',
    members: mockStaffMembers.filter((s) => s.role === 'support_staff'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'group_3',
    name: 'Management',
    description: 'Managers and administrators',
    members: mockStaffMembers.filter((s) => s.role === 'manager' || s.role === 'admin'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
]

// ============ Internal Notes ============
export const mockInternalNotes: InternalNote[] = [
  {
    id: 'note_1',
    chatId: '81901234567@s.whatsapp.net',
    authorId: 'staff_1',
    author: mockStaffMembers[0],
    content: 'Customer is interested in Land Cruiser. Prefers morning calls.',
    mentions: [],
    createdAt: new Date('2024-01-19T10:00:00'),
  },
  {
    id: 'note_2',
    chatId: '81901234567@s.whatsapp.net',
    authorId: 'staff_3',
    author: mockStaffMembers[2],
    content: '@staff_1 Please follow up with a quote by EOD.',
    mentions: ['staff_1'],
    createdAt: new Date('2024-01-19T11:30:00'),
  },
  {
    id: 'note_3',
    chatId: '81801234567@s.whatsapp.net',
    authorId: 'staff_2',
    author: mockStaffMembers[1],
    content: 'Business account - Yuki Motors. They buy in bulk. VIP treatment.',
    mentions: [],
    createdAt: new Date('2024-01-18T09:00:00'),
  },
]

// ============ Enhanced Chats ============
export const mockEnhancedChats: EnhancedChat[] = mockChats.map((chat, index) => ({
  ...chat,
  labels: index === 0
    ? [mockLabels[0], mockLabels[2]] // Lead, VIP
    : index === 1
    ? [mockLabels[2]] // VIP
    : index === 3
    ? [mockLabels[1], mockLabels[4]] // Support, Urgent
    : [],
  snooze: index === 4
    ? {
        preset: 'tomorrow' as const,
        returnAt: new Date(Date.now() + 86400000), // Tomorrow
        createdAt: new Date(),
      }
    : undefined,
  assignment: index === 0 || index === 1
    ? {
        chatId: chat.id,
        assignedTo: mockStaffMembers[0],
        assignedBy: mockStaffMembers[2],
        assignedAt: new Date('2024-01-19T08:00:00'),
      }
    : index === 3
    ? {
        chatId: chat.id,
        assignedTo: mockStaffMembers[1],
        assignedBy: mockStaffMembers[2],
        assignedAt: new Date('2024-01-19T14:00:00'),
      }
    : undefined,
  internalNotes: mockInternalNotes.filter((note) => note.chatId === chat.id),
  status: index === 4 ? 'snoozed' : index === 5 ? 'archived' : 'active',
  isUnread: chat.unreadCount > 0,
  lastStaffInteraction: new Date(Date.now() - Math.random() * 86400000),
}))

// ============ User Preferences ============
export const mockUserPreferences: UserPreferences = {
  defaultReplyMode: 'reply',
  keyboardShortcuts: {
    send: 'enter',
    sendAndArchive: 'ctrl_enter',
  },
}

// ============ Team Performance Stats ============
export const mockTeamPerformance: StaffPerformance[] = mockStaffMembers
  .filter((s) => s.role === 'sales_staff' || s.role === 'support_staff')
  .map((staff) => ({
    staff,
    messagesSent: Math.floor(Math.random() * 200) + 50,
    messagesReceived: Math.floor(Math.random() * 180) + 40,
    avgResponseTime: Math.round((Math.random() * 10 + 1) * 10) / 10, // 1-11 minutes
    activeChats: Math.floor(Math.random() * 20) + 5,
    resolvedChats: Math.floor(Math.random() * 50) + 20,
    resolutionRate: Math.round((Math.random() * 15 + 85) * 10) / 10, // 85-100%
  }))

// ============ Helper Functions ============
export function getActiveChats(): EnhancedChat[] {
  return mockEnhancedChats.filter((chat) => chat.status === 'active')
}

export function getArchivedChats(): EnhancedChat[] {
  return mockEnhancedChats.filter((chat) => chat.status === 'archived')
}

export function getSnoozedChats(): EnhancedChat[] {
  return mockEnhancedChats.filter((chat) => chat.status === 'snoozed')
}

export function getChatCounts(): { active: number; archived: number; snoozed: number } {
  return {
    active: getActiveChats().length,
    archived: getArchivedChats().length,
    snoozed: getSnoozedChats().length,
  }
}
