import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchInstance,
  createInstance,
  getQRCode,
  getConnectionState,
  disconnectInstance,
  fetchContacts,
  searchContacts,
  fetchChats,
  fetchMessages,
  sendTextMessage,
  sendMediaMessage,
  markAsRead,
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  fetchBroadcastLists,
  createBroadcastList,
  fetchBroadcasts,
  sendBroadcast,
  fetchWhatsAppStats,
  getWebhookConfig,
  setWebhookConfig,
  // New API functions
  fetchLabels,
  createLabel,
  updateLabel,
  deleteLabel,
  addLabelToChat,
  removeLabelFromChat,
  archiveChat,
  unarchiveChat,
  snoozeChat,
  cancelSnooze,
  markAsUnread,
  fetchEnhancedChats,
  fetchStaffMembers,
  fetchStaffGroups,
  createStaffGroup,
  updateStaffGroup,
  deleteStaffGroup,
  assignChatToStaff,
  unassignChat,
  fetchInternalNotes,
  createInternalNote,
  deleteInternalNote,
  fetchEnhancedStats,
  fetchTeamPerformance,
  validatePhoneNumber,
  createNewConversation,
  fetchUserPreferences,
  updateUserPreferences,
} from '@/lib/api/whatsapp'
import type {
  CreateInstanceRequest,
  SendTextRequest,
  SendMediaRequest,
  MessageTemplate,
  BroadcastList,
  BroadcastMessage,
  WebhookConfig,
  ConversationLabel,
  StaffGroup,
  InternalNote,
  ChatStatus,
  NewConversationRequest,
  StatsDateRange,
  UserPreferences,
} from '@/features/whatsapp/types'

// ============ Instance Hooks ============

export function useWhatsAppInstance() {
  return useQuery({
    queryKey: ['whatsapp', 'instance'],
    queryFn: fetchInstance,
    staleTime: 30000,
  })
}

export function useCreateInstance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInstanceRequest) => createInstance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'instance'] })
    },
  })
}

export function useQRCode(instanceName: string, enabled = true) {
  return useQuery({
    queryKey: ['whatsapp', 'qrcode', instanceName],
    queryFn: () => getQRCode(instanceName),
    enabled,
    refetchInterval: 20000, // Refresh QR code every 20 seconds
  })
}

export function useConnectionState(instanceName: string) {
  return useQuery({
    queryKey: ['whatsapp', 'connection', instanceName],
    queryFn: () => getConnectionState(instanceName),
    refetchInterval: 5000,
  })
}

export function useDisconnectInstance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (instanceName: string) => disconnectInstance(instanceName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp'] })
    },
  })
}

// ============ Contact Hooks ============

export function useWhatsAppContacts() {
  return useQuery({
    queryKey: ['whatsapp', 'contacts'],
    queryFn: fetchContacts,
    staleTime: 60000,
  })
}

export function useSearchContacts(query: string) {
  return useQuery({
    queryKey: ['whatsapp', 'contacts', 'search', query],
    queryFn: () => searchContacts(query),
    enabled: query.length > 2,
  })
}

// ============ Chat Hooks ============

export function useWhatsAppChats() {
  return useQuery({
    queryKey: ['whatsapp', 'chats'],
    queryFn: fetchChats,
    refetchInterval: 10000,
  })
}

export function useMessages(chatId: string, enabled = true) {
  return useQuery({
    queryKey: ['whatsapp', 'messages', chatId],
    queryFn: () => fetchMessages(chatId),
    enabled,
    refetchInterval: 5000,
  })
}

export function useSendTextMessage(instanceName: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SendTextRequest) => sendTextMessage(instanceName, data),
    onSuccess: (_, variables) => {
      const chatId = `${variables.number.replace(/\D/g, '')}@s.whatsapp.net`
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'messages', chatId] })
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'chats'] })
    },
  })
}

export function useSendMediaMessage(instanceName: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SendMediaRequest) => sendMediaMessage(instanceName, data),
    onSuccess: (_, variables) => {
      const chatId = `${variables.number.replace(/\D/g, '')}@s.whatsapp.net`
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'messages', chatId] })
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'chats'] })
    },
  })
}

export function useMarkAsRead(instanceName: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (chatId: string) => markAsRead(instanceName, chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'chats'] })
    },
  })
}

// ============ Template Hooks ============

export function useMessageTemplates() {
  return useQuery({
    queryKey: ['whatsapp', 'templates'],
    queryFn: fetchTemplates,
    staleTime: 60000,
  })
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<MessageTemplate, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>) =>
      createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'templates'] })
    },
  })
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MessageTemplate> }) =>
      updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'templates'] })
    },
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'templates'] })
    },
  })
}

// ============ Broadcast Hooks ============

export function useBroadcastLists() {
  return useQuery({
    queryKey: ['whatsapp', 'broadcast-lists'],
    queryFn: fetchBroadcastLists,
    staleTime: 60000,
  })
}

export function useCreateBroadcastList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<BroadcastList, 'id' | 'createdAt'>) => createBroadcastList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'broadcast-lists'] })
    },
  })
}

export function useBroadcasts() {
  return useQuery({
    queryKey: ['whatsapp', 'broadcasts'],
    queryFn: fetchBroadcasts,
    refetchInterval: 30000,
  })
}

export function useSendBroadcast() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (
      data: Omit<
        BroadcastMessage,
        'id' | 'sent' | 'delivered' | 'read' | 'failed' | 'status' | 'sentAt' | 'completedAt'
      >
    ) => sendBroadcast(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'broadcasts'] })
    },
  })
}

// ============ Stats Hooks ============

export function useWhatsAppStats() {
  return useQuery({
    queryKey: ['whatsapp', 'stats'],
    queryFn: fetchWhatsAppStats,
    refetchInterval: 30000,
  })
}

// ============ Webhook Hooks ============

export function useWebhookConfig(instanceName: string) {
  return useQuery({
    queryKey: ['whatsapp', 'webhook', instanceName],
    queryFn: () => getWebhookConfig(instanceName),
  })
}

export function useSetWebhookConfig(instanceName: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (config: WebhookConfig) => setWebhookConfig(instanceName, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'webhook', instanceName] })
    },
  })
}

// ============ Label Hooks ============

export function useConversationLabels() {
  return useQuery({
    queryKey: ['whatsapp', 'labels'],
    queryFn: fetchLabels,
    staleTime: 300000, // 5 minutes
  })
}

export function useCreateLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<ConversationLabel, 'id' | 'createdAt' | 'updatedAt'>) =>
      createLabel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'labels'] })
    },
  })
}

export function useUpdateLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ConversationLabel> }) =>
      updateLabel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'labels'] })
    },
  })
}

export function useDeleteLabel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteLabel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'labels'] })
    },
  })
}

export function useAddLabelToChat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ chatId, labelId }: { chatId: string; labelId: string }) =>
      addLabelToChat(chatId, labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'enhanced-chats'] })
    },
  })
}

export function useRemoveLabelFromChat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ chatId, labelId }: { chatId: string; labelId: string }) =>
      removeLabelFromChat(chatId, labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'enhanced-chats'] })
    },
  })
}

// ============ Archive & Snooze Hooks ============

export function useArchiveChat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (chatId: string) => archiveChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'enhanced-chats'] })
    },
  })
}

export function useUnarchiveChat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (chatId: string) => unarchiveChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'enhanced-chats'] })
    },
  })
}

export function useSnoozeChat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      chatId,
      returnAt,
      preset,
    }: {
      chatId: string
      returnAt: Date
      preset: string
    }) => snoozeChat(chatId, returnAt, preset),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'enhanced-chats'] })
    },
  })
}

export function useCancelSnooze() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (chatId: string) => cancelSnooze(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'enhanced-chats'] })
    },
  })
}

export function useMarkAsUnread() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (chatId: string) => markAsUnread(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'enhanced-chats'] })
    },
  })
}

// ============ Enhanced Chat Hooks ============

export function useEnhancedChats(options?: {
  status?: ChatStatus
  labelId?: string
  assignedTo?: string
  search?: string
}) {
  return useQuery({
    queryKey: ['whatsapp', 'enhanced-chats', options],
    queryFn: () => fetchEnhancedChats(options),
    refetchInterval: 10000,
  })
}

export function useActiveChats() {
  return useEnhancedChats({ status: 'active' })
}

export function useArchivedChats() {
  return useEnhancedChats({ status: 'archived' })
}

export function useSnoozedChats() {
  return useQuery({
    queryKey: ['whatsapp', 'enhanced-chats', { status: 'snoozed' }],
    queryFn: () => fetchEnhancedChats({ status: 'snoozed' }),
    refetchInterval: 60000, // Check for unsnoozed chats every minute
  })
}

// ============ Staff & Assignment Hooks ============

export function useStaffMembers() {
  return useQuery({
    queryKey: ['whatsapp', 'staff'],
    queryFn: fetchStaffMembers,
    staleTime: 60000,
  })
}

export function useStaffGroups() {
  return useQuery({
    queryKey: ['whatsapp', 'staff-groups'],
    queryFn: fetchStaffGroups,
    staleTime: 60000,
  })
}

export function useCreateStaffGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<StaffGroup, 'id' | 'createdAt' | 'updatedAt'>) =>
      createStaffGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'staff-groups'] })
    },
  })
}

export function useUpdateStaffGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StaffGroup> }) =>
      updateStaffGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'staff-groups'] })
    },
  })
}

export function useDeleteStaffGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteStaffGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'staff-groups'] })
    },
  })
}

export function useAssignChat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ chatId, staffId }: { chatId: string; staffId: string }) =>
      assignChatToStaff(chatId, staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'enhanced-chats'] })
    },
  })
}

export function useUnassignChat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (chatId: string) => unassignChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'enhanced-chats'] })
    },
  })
}

// ============ Internal Notes Hooks ============

export function useInternalNotes(chatId: string) {
  return useQuery({
    queryKey: ['whatsapp', 'notes', chatId],
    queryFn: () => fetchInternalNotes(chatId),
    enabled: !!chatId,
  })
}

export function useCreateInternalNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<InternalNote, 'id' | 'createdAt' | 'author'>) =>
      createInternalNote(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['whatsapp', 'notes', variables.chatId],
      })
    },
  })
}

export function useDeleteInternalNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ noteId, chatId }: { noteId: string; chatId: string }) =>
      deleteInternalNote(noteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['whatsapp', 'notes', variables.chatId],
      })
    },
  })
}

// ============ Enhanced Stats Hooks ============

export function useEnhancedStats(options?: {
  dateRange?: StatsDateRange
  userId?: string
}) {
  return useQuery({
    queryKey: ['whatsapp', 'enhanced-stats', options],
    queryFn: () => fetchEnhancedStats(options),
    refetchInterval: 60000,
  })
}

export function useTeamPerformance(dateRange?: StatsDateRange) {
  return useQuery({
    queryKey: ['whatsapp', 'team-performance', dateRange],
    queryFn: () => fetchTeamPerformance(dateRange),
    refetchInterval: 60000,
  })
}

// ============ New Conversation Hooks ============

export function useValidatePhoneNumber() {
  return useMutation({
    mutationFn: ({
      phoneNumber,
      countryCode,
    }: {
      phoneNumber: string
      countryCode: string
    }) => validatePhoneNumber(phoneNumber, countryCode),
  })
}

export function useCreateConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: NewConversationRequest) => createNewConversation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'enhanced-chats'] })
    },
  })
}

// ============ User Preferences Hooks ============

export function useUserPreferences() {
  return useQuery({
    queryKey: ['whatsapp', 'preferences'],
    queryFn: fetchUserPreferences,
    staleTime: Infinity,
  })
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<UserPreferences>) => updateUserPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'preferences'] })
    },
  })
}
