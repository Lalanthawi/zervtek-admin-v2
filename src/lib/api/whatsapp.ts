import type {
  WhatsAppInstance,
  Contact,
  Chat,
  Message,
  MessageTemplate,
  BroadcastList,
  BroadcastMessage,
  WhatsAppStats,
  SendTextRequest,
  SendMediaRequest,
  CreateInstanceRequest,
  WebhookConfig,
  QRCodeData,
  ConversationLabel,
  StaffMember,
  StaffGroup,
  InternalNote,
  EnhancedChat,
  StaffPerformance,
  UserPreferences,
  ChatStatus,
  NewConversationRequest,
  StatsDateRange,
  EnhancedWhatsAppStats,
} from '@/features/whatsapp/types'
import {
  mockInstance,
  mockContacts,
  mockChats,
  mockTemplates,
  mockBroadcastLists,
  mockBroadcasts,
  generateMockStats,
  mockLabels,
  mockStaffMembers,
  mockStaffGroups,
  mockInternalNotes,
  mockEnhancedChats,
  mockUserPreferences,
  mockTeamPerformance,
} from '@/features/whatsapp/data/mock-data'

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// In production, this would be the Evolution API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || 'http://localhost:8080'
const API_KEY = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY || ''

// For now, using mock data - in production, replace with actual API calls

// ============ Instance Management ============

export async function fetchInstance(): Promise<WhatsAppInstance> {
  await delay(500)
  return mockInstance
}

export async function createInstance(data: CreateInstanceRequest): Promise<WhatsAppInstance> {
  await delay(1000)
  return {
    ...mockInstance,
    instanceName: data.instanceName,
    status: 'connecting',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export async function getQRCode(instanceName: string): Promise<QRCodeData> {
  await delay(500)
  // In production, this would return actual QR code from Evolution API
  return {
    code: 'mock-qr-code-data',
    base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAABeklEQVR42uyYMQ6AIBAE/+L/f4mVFRYWxkQTCwsjFiYWJhYmFsYWJhbGFsYWxhYmFsYWJhbGFiYWxhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFiYWJhYmFqYWxhYmFsYWJhbGFiYWxhYmFsYWJhbGFiYWxhYmFv8WZgAAAABJRU5ErkJggg==',
    pairingCode: '1234-5678',
  }
}

export async function getConnectionState(instanceName: string): Promise<{ state: string }> {
  await delay(300)
  return { state: mockInstance.status }
}

export async function disconnectInstance(instanceName: string): Promise<void> {
  await delay(500)
}

export async function deleteInstance(instanceName: string): Promise<void> {
  await delay(500)
}

// ============ Contacts ============

export async function fetchContacts(): Promise<Contact[]> {
  await delay(600)
  return mockContacts
}

export async function searchContacts(query: string): Promise<Contact[]> {
  await delay(300)
  const lowerQuery = query.toLowerCase()
  return mockContacts.filter(
    (c) =>
      c.pushName.toLowerCase().includes(lowerQuery) ||
      c.number.includes(query)
  )
}

export async function checkWhatsAppNumber(number: string): Promise<{ exists: boolean; jid: string }> {
  await delay(400)
  return { exists: true, jid: `${number.replace(/\D/g, '')}@s.whatsapp.net` }
}

// ============ Chats & Messages ============

export async function fetchChats(): Promise<Chat[]> {
  await delay(700)
  return mockChats.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    const aTime = a.lastMessage?.messageTimestamp || 0
    const bTime = b.lastMessage?.messageTimestamp || 0
    return bTime - aTime
  })
}

export async function fetchMessages(chatId: string, limit = 50): Promise<Message[]> {
  await delay(400)
  const chat = mockChats.find((c) => c.id === chatId)
  return chat?.messages || []
}

export async function sendTextMessage(
  instanceName: string,
  data: SendTextRequest
): Promise<Message> {
  await delay(500)
  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    key: {
      remoteJid: `${data.number.replace(/\D/g, '')}@s.whatsapp.net`,
      fromMe: true,
      id: `sent_${Date.now()}`,
    },
    message: { conversation: data.text },
    messageType: 'text',
    messageTimestamp: Date.now(),
    status: 'sent',
  }
  return newMessage
}

export async function sendMediaMessage(
  instanceName: string,
  data: SendMediaRequest
): Promise<Message> {
  await delay(800)
  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    key: {
      remoteJid: `${data.number.replace(/\D/g, '')}@s.whatsapp.net`,
      fromMe: true,
      id: `sent_${Date.now()}`,
    },
    message: {
      imageMessage: data.mediatype === 'image' ? {
        url: data.media,
        caption: data.caption,
        mimetype: 'image/jpeg',
      } : undefined,
    },
    messageType: data.mediatype,
    messageTimestamp: Date.now(),
    status: 'sent',
  }
  return newMessage
}

export async function markAsRead(instanceName: string, chatId: string): Promise<void> {
  await delay(200)
}

// ============ Templates ============

export async function fetchTemplates(): Promise<MessageTemplate[]> {
  await delay(500)
  return mockTemplates
}

export async function createTemplate(
  template: Omit<MessageTemplate, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>
): Promise<MessageTemplate> {
  await delay(600)
  return {
    ...template,
    id: `tmpl_${Date.now()}`,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export async function updateTemplate(
  id: string,
  template: Partial<MessageTemplate>
): Promise<MessageTemplate> {
  await delay(500)
  const existing = mockTemplates.find((t) => t.id === id)
  if (!existing) throw new Error('Template not found')
  return { ...existing, ...template, updatedAt: new Date() }
}

export async function deleteTemplate(id: string): Promise<void> {
  await delay(400)
}

// ============ Broadcast ============

export async function fetchBroadcastLists(): Promise<BroadcastList[]> {
  await delay(500)
  return mockBroadcastLists
}

export async function createBroadcastList(
  data: Omit<BroadcastList, 'id' | 'createdAt'>
): Promise<BroadcastList> {
  await delay(600)
  return {
    ...data,
    id: `blist_${Date.now()}`,
    createdAt: new Date(),
  }
}

export async function fetchBroadcasts(): Promise<BroadcastMessage[]> {
  await delay(500)
  return mockBroadcasts
}

export async function sendBroadcast(
  data: Omit<BroadcastMessage, 'id' | 'sent' | 'delivered' | 'read' | 'failed' | 'status' | 'sentAt' | 'completedAt'>
): Promise<BroadcastMessage> {
  await delay(1000)
  return {
    ...data,
    id: `bc_${Date.now()}`,
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
    status: data.scheduledAt ? 'scheduled' : 'sending',
    sentAt: data.scheduledAt ? undefined : new Date(),
  }
}

// ============ Stats ============

export async function fetchWhatsAppStats(): Promise<WhatsAppStats> {
  await delay(400)
  return generateMockStats()
}

// ============ Webhook ============

export async function getWebhookConfig(instanceName: string): Promise<WebhookConfig | null> {
  await delay(300)
  return {
    url: mockInstance.webhookUrl || '',
    webhookByEvents: true,
    webhookBase64: false,
    events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'QRCODE_UPDATED'],
  }
}

export async function setWebhookConfig(
  instanceName: string,
  config: WebhookConfig
): Promise<WebhookConfig> {
  await delay(500)
  return config
}

// ============ Labels ============

export async function fetchLabels(): Promise<ConversationLabel[]> {
  await delay(300)
  return mockLabels
}

export async function createLabel(
  data: Omit<ConversationLabel, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ConversationLabel> {
  await delay(400)
  return {
    ...data,
    id: `label_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export async function updateLabel(
  id: string,
  data: Partial<ConversationLabel>
): Promise<ConversationLabel> {
  await delay(300)
  const existing = mockLabels.find((l) => l.id === id)
  if (!existing) throw new Error('Label not found')
  return { ...existing, ...data, updatedAt: new Date() }
}

export async function deleteLabel(id: string): Promise<void> {
  await delay(300)
}

export async function addLabelToChat(chatId: string, labelId: string): Promise<void> {
  await delay(200)
}

export async function removeLabelFromChat(chatId: string, labelId: string): Promise<void> {
  await delay(200)
}

// ============ Archive & Snooze ============

export async function archiveChat(chatId: string): Promise<{ success: boolean; status: ChatStatus }> {
  await delay(300)
  return { success: true, status: 'archived' }
}

export async function unarchiveChat(chatId: string): Promise<{ success: boolean; status: ChatStatus }> {
  await delay(300)
  return { success: true, status: 'active' }
}

export async function snoozeChat(
  chatId: string,
  returnAt: Date,
  preset: string
): Promise<{ success: boolean; status: ChatStatus; returnAt: Date }> {
  await delay(300)
  return { success: true, status: 'snoozed', returnAt }
}

export async function cancelSnooze(chatId: string): Promise<{ success: boolean; status: ChatStatus }> {
  await delay(200)
  return { success: true, status: 'active' }
}

export async function markAsUnread(chatId: string): Promise<void> {
  await delay(200)
}

// ============ Enhanced Chats ============

export async function fetchEnhancedChats(options?: {
  status?: ChatStatus
  labelId?: string
  assignedTo?: string
  search?: string
}): Promise<{ chats: EnhancedChat[]; counts: { active: number; archived: number; snoozed: number } }> {
  await delay(500)

  let filteredChats = [...mockEnhancedChats]

  if (options?.status) {
    filteredChats = filteredChats.filter((c) => c.status === options.status)
  }

  if (options?.labelId) {
    filteredChats = filteredChats.filter((c) =>
      c.labels.some((l) => l.id === options.labelId)
    )
  }

  if (options?.assignedTo) {
    filteredChats = filteredChats.filter(
      (c) => c.assignment?.assignedTo.id === options.assignedTo
    )
  }

  if (options?.search) {
    const lowerSearch = options.search.toLowerCase()
    filteredChats = filteredChats.filter(
      (c) =>
        c.contact.pushName.toLowerCase().includes(lowerSearch) ||
        c.contact.number.includes(options.search!)
    )
  }

  // Sort: pinned first, then by last message
  filteredChats.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    const aTime = a.lastMessage?.messageTimestamp || 0
    const bTime = b.lastMessage?.messageTimestamp || 0
    return bTime - aTime
  })

  return {
    chats: filteredChats,
    counts: {
      active: mockEnhancedChats.filter((c) => c.status === 'active').length,
      archived: mockEnhancedChats.filter((c) => c.status === 'archived').length,
      snoozed: mockEnhancedChats.filter((c) => c.status === 'snoozed').length,
    },
  }
}

// ============ Staff & Assignment ============

export async function fetchStaffMembers(): Promise<StaffMember[]> {
  await delay(400)
  return mockStaffMembers
}

export async function fetchStaffGroups(): Promise<StaffGroup[]> {
  await delay(400)
  return mockStaffGroups
}

export async function createStaffGroup(
  data: Omit<StaffGroup, 'id' | 'createdAt' | 'updatedAt'>
): Promise<StaffGroup> {
  await delay(500)
  return {
    ...data,
    id: `group_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export async function updateStaffGroup(
  id: string,
  data: Partial<StaffGroup>
): Promise<StaffGroup> {
  await delay(400)
  const existing = mockStaffGroups.find((g) => g.id === id)
  if (!existing) throw new Error('Staff group not found')
  return { ...existing, ...data, updatedAt: new Date() }
}

export async function deleteStaffGroup(id: string): Promise<void> {
  await delay(300)
}

export async function assignChatToStaff(
  chatId: string,
  staffId: string
): Promise<void> {
  await delay(300)
}

export async function unassignChat(chatId: string): Promise<void> {
  await delay(200)
}

// ============ Internal Notes ============

export async function fetchInternalNotes(chatId: string): Promise<InternalNote[]> {
  await delay(300)
  return mockInternalNotes.filter((n) => n.chatId === chatId)
}

export async function createInternalNote(
  data: Omit<InternalNote, 'id' | 'createdAt' | 'author'>
): Promise<InternalNote> {
  await delay(400)
  const author = mockStaffMembers.find((s) => s.id === data.authorId)
  if (!author) throw new Error('Author not found')
  return {
    ...data,
    id: `note_${Date.now()}`,
    author,
    createdAt: new Date(),
  }
}

export async function deleteInternalNote(noteId: string): Promise<void> {
  await delay(200)
}

// ============ Enhanced Stats ============

export async function fetchEnhancedStats(options?: {
  dateRange?: StatsDateRange
  userId?: string
}): Promise<EnhancedWhatsAppStats> {
  await delay(500)
  const baseStats = generateMockStats()
  return {
    ...baseStats,
    userId: options?.userId,
    dateRange: options?.dateRange,
    teamStats: mockTeamPerformance,
  }
}

export async function fetchTeamPerformance(
  dateRange?: StatsDateRange
): Promise<StaffPerformance[]> {
  await delay(600)
  return mockTeamPerformance
}

// ============ New Conversation ============

export async function validatePhoneNumber(
  phoneNumber: string,
  countryCode: string
): Promise<{ valid: boolean; formatted: string; whatsappRegistered: boolean; error?: string }> {
  await delay(300)

  const cleanNumber = phoneNumber.replace(/\D/g, '')

  if (cleanNumber.length < 6) {
    return {
      valid: false,
      formatted: '',
      whatsappRegistered: false,
      error: 'Phone number is too short',
    }
  }

  const formatted = `${countryCode} ${cleanNumber.slice(0, 3)} ${cleanNumber.slice(3, 7)} ${cleanNumber.slice(7)}`.trim()

  return {
    valid: true,
    formatted,
    whatsappRegistered: true,
  }
}

export async function createNewConversation(
  data: NewConversationRequest
): Promise<EnhancedChat> {
  await delay(600)

  const fullNumber = `${data.countryCode}${data.phoneNumber.replace(/\D/g, '')}`
  const jid = `${fullNumber.replace(/\D/g, '')}@s.whatsapp.net`

  const newChat: EnhancedChat = {
    id: jid,
    contact: {
      id: jid,
      pushName: data.name || fullNumber,
      number: fullNumber,
      isGroup: false,
      isMyContact: false,
      isBusiness: false,
      unreadCount: 0,
    },
    messages: data.initialMessage
      ? [
          {
            id: `msg_${Date.now()}`,
            key: { remoteJid: jid, fromMe: true, id: `sent_${Date.now()}` },
            message: { conversation: data.initialMessage },
            messageType: 'text',
            messageTimestamp: Date.now(),
            status: 'sent',
          },
        ]
      : [],
    lastMessage: data.initialMessage
      ? {
          id: `msg_${Date.now()}`,
          key: { remoteJid: jid, fromMe: true, id: `sent_${Date.now()}` },
          message: { conversation: data.initialMessage },
          messageType: 'text',
          messageTimestamp: Date.now(),
          status: 'sent',
        }
      : undefined,
    unreadCount: 0,
    pinned: false,
    muted: false,
    archived: false,
    labels: data.labels
      ? mockLabels.filter((l) => data.labels!.includes(l.id))
      : [],
    status: 'active',
    isUnread: false,
    internalNotes: [],
    assignment: data.assignToId
      ? {
          chatId: jid,
          assignedTo: mockStaffMembers.find((s) => s.id === data.assignToId)!,
          assignedBy: mockStaffMembers[0],
          assignedAt: new Date(),
        }
      : undefined,
  }

  return newChat
}

// ============ User Preferences ============

export async function fetchUserPreferences(): Promise<UserPreferences> {
  await delay(200)
  return mockUserPreferences
}

export async function updateUserPreferences(
  data: Partial<UserPreferences>
): Promise<UserPreferences> {
  await delay(300)
  return { ...mockUserPreferences, ...data }
}
