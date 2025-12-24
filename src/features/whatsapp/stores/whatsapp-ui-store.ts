import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatStatus, ReplyMode } from '../types'

interface WhatsAppUIState {
  // Active tab state
  activeTab: 'active' | 'archived'
  setActiveTab: (tab: 'active' | 'archived') => void

  // Selected chat
  selectedChatId: string | null
  setSelectedChatId: (id: string | null) => void

  // Dialog states
  newConversationOpen: boolean
  setNewConversationOpen: (open: boolean) => void

  createLabelOpen: boolean
  setCreateLabelOpen: (open: boolean) => void

  // Popover states (which chat's popover is open)
  labelPopoverChatId: string | null
  setLabelPopoverChatId: (id: string | null) => void

  snoozePopoverChatId: string | null
  setSnoozePopoverChatId: (id: string | null) => void

  assignPopoverChatId: string | null
  setAssignPopoverChatId: (id: string | null) => void

  // Reply mode
  replyMode: ReplyMode
  setReplyMode: (mode: ReplyMode) => void

  // Internal note mode (when composing a note instead of message)
  internalNoteMode: boolean
  setInternalNoteMode: (mode: boolean) => void

  // Search/filter
  searchTerm: string
  setSearchTerm: (term: string) => void

  labelFilter: string[] // Label IDs
  setLabelFilter: (ids: string[]) => void
  toggleLabelFilter: (id: string) => void
  clearLabelFilter: () => void

  assignmentFilter: string | null // Staff ID or 'unassigned'
  setAssignmentFilter: (id: string | null) => void

  // Reset all UI state
  resetUI: () => void
}

const initialState = {
  activeTab: 'active' as const,
  selectedChatId: null,
  newConversationOpen: false,
  createLabelOpen: false,
  labelPopoverChatId: null,
  snoozePopoverChatId: null,
  assignPopoverChatId: null,
  replyMode: 'reply' as ReplyMode,
  internalNoteMode: false,
  searchTerm: '',
  labelFilter: [],
  assignmentFilter: null,
}

export const useWhatsAppUIStore = create<WhatsAppUIState>()(
  persist(
    (set) => ({
      ...initialState,

      setActiveTab: (tab) => set({ activeTab: tab }),

      setSelectedChatId: (id) => set({ selectedChatId: id }),

      setNewConversationOpen: (open) => set({ newConversationOpen: open }),

      setCreateLabelOpen: (open) => set({ createLabelOpen: open }),

      setLabelPopoverChatId: (id) => set({ labelPopoverChatId: id }),

      setSnoozePopoverChatId: (id) => set({ snoozePopoverChatId: id }),

      setAssignPopoverChatId: (id) => set({ assignPopoverChatId: id }),

      setReplyMode: (mode) => set({ replyMode: mode }),

      setInternalNoteMode: (mode) => set({ internalNoteMode: mode }),

      setSearchTerm: (term) => set({ searchTerm: term }),

      setLabelFilter: (ids) => set({ labelFilter: ids }),

      toggleLabelFilter: (id) =>
        set((state) => ({
          labelFilter: state.labelFilter.includes(id)
            ? state.labelFilter.filter((l) => l !== id)
            : [...state.labelFilter, id],
        })),

      clearLabelFilter: () => set({ labelFilter: [] }),

      setAssignmentFilter: (id) => set({ assignmentFilter: id }),

      resetUI: () =>
        set({
          ...initialState,
          // Keep persisted values
        }),
    }),
    {
      name: 'whatsapp-ui-storage',
      partialize: (state) => ({
        // Only persist these values
        replyMode: state.replyMode,
        activeTab: state.activeTab,
      }),
    }
  )
)

// Selector hooks for common use cases
export const useSelectedChatId = () => useWhatsAppUIStore((state) => state.selectedChatId)
export const useActiveTab = () => useWhatsAppUIStore((state) => state.activeTab)
export const useReplyMode = () => useWhatsAppUIStore((state) => state.replyMode)
export const useSearchTerm = () => useWhatsAppUIStore((state) => state.searchTerm)
export const useLabelFilter = () => useWhatsAppUIStore((state) => state.labelFilter)
