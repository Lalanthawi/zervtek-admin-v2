# WhatsApp Inbox System - Backend API Requirements

This document outlines the backend API endpoints required for the WhatsApp inbox system.

---

## Base URL
```
/api/whatsapp
```

---

## 1. Labels API

### GET /labels
Fetch all conversation labels.

**Response:**
```json
{
  "labels": [
    {
      "id": "label_1",
      "name": "Hot Lead",
      "color": "red",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /labels
Create a new label.

**Request:**
```json
{
  "name": "VIP Customer",
  "color": "amber"
}
```

**Response:** Created label object

### PATCH /labels/:id
Update a label.

**Request:**
```json
{
  "name": "Updated Name",
  "color": "blue"
}
```

### DELETE /labels/:id
Delete a label.

### POST /chats/:chatId/labels/:labelId
Add a label to a chat.

### DELETE /chats/:chatId/labels/:labelId
Remove a label from a chat.

---

## 2. Archive & Snooze API

### POST /chats/:chatId/archive
Archive a chat.

**Response:**
```json
{
  "success": true,
  "chatId": "chat_123",
  "status": "archived"
}
```

### POST /chats/:chatId/unarchive
Unarchive a chat (move back to active).

### POST /chats/:chatId/snooze
Snooze a chat until a specified time.

**Request:**
```json
{
  "preset": "tomorrow",
  "returnAt": "2024-01-16T09:00:00Z"
}
```

**Preset Values:**
- `later_today` - Returns at 5 PM or +4 hours
- `tomorrow` - Returns at 9 AM next day
- `weekend` - Returns Saturday 10 AM
- `next_week` - Returns Monday 9 AM
- `custom` - Uses provided `returnAt` timestamp

**Response:**
```json
{
  "success": true,
  "chatId": "chat_123",
  "status": "snoozed",
  "snooze": {
    "preset": "tomorrow",
    "returnAt": "2024-01-16T09:00:00Z",
    "createdAt": "2024-01-15T14:30:00Z"
  }
}
```

### DELETE /chats/:chatId/snooze
Cancel a snooze and return chat to active.

### Background Job: Snooze Expiry
- Check snoozed chats every minute
- When `returnAt` is reached, move chat back to active status
- Optionally send notification to assigned staff

---

## 3. Chats API (Enhanced)

### GET /chats
Fetch chats with filtering.

**Query Parameters:**
- `status`: `active` | `archived` | `snoozed` (default: `active`)
- `labelId`: Filter by label
- `assignedTo`: Filter by staff ID
- `search`: Search by contact name/number

**Response:**
```json
{
  "chats": [
    {
      "id": "chat_123",
      "contact": { /* Contact object */ },
      "lastMessage": { /* Message object */ },
      "messages": [],
      "unreadCount": 2,
      "pinned": false,
      "muted": false,
      "archived": false,
      "labels": [
        { "id": "label_1", "name": "Hot Lead", "color": "red" }
      ],
      "status": "active",
      "isUnread": true,
      "snooze": null,
      "assignment": {
        "assignedTo": { "id": "staff_1", "firstName": "Sarah", "lastName": "Miller" },
        "assignedBy": { "id": "staff_2", "firstName": "John", "lastName": "Doe" },
        "assignedAt": "2024-01-15T10:00:00Z"
      },
      "internalNotes": [],
      "lastStaffInteraction": "2024-01-15T11:30:00Z"
    }
  ],
  "counts": {
    "active": 12,
    "archived": 45,
    "snoozed": 3
  }
}
```

### Auto-Unarchive Webhook
When a customer sends a new message to an archived chat:
1. Automatically move chat to active status
2. Clear any snooze settings
3. Mark as unread
4. Set `returnedFromArchive: true` for UI indicator

---

## 4. Staff & Assignment API

### GET /staff
Fetch all staff members.

**Response:**
```json
{
  "staff": [
    {
      "id": "staff_1",
      "firstName": "Sarah",
      "lastName": "Miller",
      "email": "sarah@example.com",
      "role": "sales_staff",
      "avatarUrl": "https://...",
      "isOnline": true
    }
  ]
}
```

### GET /staff/groups
Fetch staff groups.

**Response:**
```json
{
  "groups": [
    {
      "id": "group_1",
      "name": "Sales Team",
      "description": "All sales staff",
      "members": [ /* Staff objects */ ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### POST /staff/groups
Create a staff group.

**Request:**
```json
{
  "name": "Support Team",
  "description": "Customer support staff",
  "memberIds": ["staff_1", "staff_2"]
}
```

### PATCH /staff/groups/:id
Update a staff group.

### DELETE /staff/groups/:id
Delete a staff group.

### POST /chats/:chatId/assign
Assign a chat to a staff member.

**Request:**
```json
{
  "staffId": "staff_1"
}
```

### DELETE /chats/:chatId/assign
Remove assignment from a chat.

---

## 5. Internal Notes API

### GET /chats/:chatId/notes
Fetch internal notes for a chat.

**Response:**
```json
{
  "notes": [
    {
      "id": "note_1",
      "chatId": "chat_123",
      "authorId": "staff_1",
      "author": { "id": "staff_1", "firstName": "Sarah", "lastName": "Miller" },
      "content": "Customer prefers morning calls. @john please follow up.",
      "mentions": ["staff_2"],
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /chats/:chatId/notes
Create an internal note.

**Request:**
```json
{
  "content": "Customer interested in premium package. @sarah to prepare quote.",
  "mentions": ["staff_1"]
}
```

**Note:** Internal notes are never sent to the customer. They are visible only to staff.

---

## 6. Statistics API

### GET /stats
Fetch WhatsApp statistics.

**Query Parameters:**
- `from`: Start date (ISO string)
- `to`: End date (ISO string)
- `userId`: Filter by user (for role-based views)

**Response (Admin/Manager):**
```json
{
  "overview": {
    "totalContacts": 1247,
    "totalChats": 523,
    "messagesSent": 4523,
    "messagesReceived": 3892,
    "messagesDelivered": 4100,
    "messagesRead": 3800,
    "activeChats": 45,
    "broadcastsSent": 12,
    "templatesUsed": 234,
    "avgResponseTime": 4.2
  },
  "teamStats": [
    {
      "staff": { "id": "staff_1", "firstName": "Sarah", "lastName": "Miller" },
      "messagesSent": 156,
      "messagesReceived": 134,
      "avgResponseTime": 3.2,
      "activeChats": 12,
      "resolvedChats": 45,
      "resolutionRate": 94.5
    }
  ],
  "charts": {
    "messagesOverTime": [
      { "date": "2024-01-15", "sent": 45, "received": 38 }
    ],
    "responseTimeDistribution": [
      { "range": "0-1 min", "count": 45 },
      { "range": "1-5 min", "count": 120 }
    ],
    "conversationsByLabel": [
      { "label": "Hot Lead", "count": 23 },
      { "label": "Support", "count": 56 }
    ]
  },
  "dateRange": {
    "from": "2024-01-01T00:00:00Z",
    "to": "2024-01-15T23:59:59Z"
  }
}
```

**Role-Based Access:**
- **Admin**: All stats, all team members
- **Manager**: Own stats + direct reports' stats
- **Staff**: Own stats only (no `teamStats` in response)

---

## 7. New Conversation API

### POST /conversations
Create a new conversation.

**Request:**
```json
{
  "phoneNumber": "801234567",
  "countryCode": "+81",
  "name": "John Doe",
  "labels": ["label_1"],
  "assignToId": "staff_1",
  "initialMessage": "Hello! Thank you for your inquiry."
}
```

**Response:**
```json
{
  "success": true,
  "chat": { /* EnhancedChat object */ },
  "messageSent": true
}
```

### POST /validate-phone
Validate a WhatsApp number.

**Request:**
```json
{
  "phoneNumber": "801234567",
  "countryCode": "+81"
}
```

**Response:**
```json
{
  "valid": true,
  "formatted": "+81 80 1234 5678",
  "whatsappRegistered": true,
  "error": null
}
```

---

## 8. User Preferences API

### GET /preferences
Fetch user preferences.

**Response:**
```json
{
  "defaultReplyMode": "reply",
  "keyboardShortcuts": {
    "send": "enter",
    "sendAndArchive": "ctrl_enter"
  }
}
```

### PATCH /preferences
Update user preferences.

**Request:**
```json
{
  "defaultReplyMode": "reply_and_archive",
  "keyboardShortcuts": {
    "send": "ctrl_enter",
    "sendAndArchive": "shift_enter"
  }
}
```

---

## 9. Mark as Read/Unread API

### POST /chats/:chatId/read
Mark a chat as read.

### POST /chats/:chatId/unread
Mark a chat as unread.

---

## Type Definitions

### LabelColor
```typescript
type LabelColor =
  | 'red' | 'orange' | 'amber' | 'yellow' | 'lime'
  | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky'
  | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia'
  | 'pink' | 'rose' | 'zinc'
```

### SnoozePreset
```typescript
type SnoozePreset = 'later_today' | 'tomorrow' | 'weekend' | 'next_week' | 'custom'
```

### StaffRole
```typescript
type StaffRole = 'admin' | 'manager' | 'sales_staff' | 'support_staff'
```

### ChatStatus
```typescript
type ChatStatus = 'active' | 'archived' | 'snoozed'
```

### ReplyMode
```typescript
type ReplyMode = 'reply' | 'reply_and_archive'
```

---

## WebSocket Events (Optional for Real-time)

If implementing real-time updates:

### Events to Emit
- `chat:new_message` - New message received
- `chat:status_changed` - Chat archived/unarchived/snoozed
- `chat:assigned` - Chat assigned to staff
- `chat:label_added` - Label added to chat
- `chat:label_removed` - Label removed from chat
- `chat:snooze_expired` - Snoozed chat returned to active
- `note:created` - New internal note added
- `staff:online_status` - Staff online/offline status change

---

## Error Responses

All endpoints should return consistent error format:

```json
{
  "error": {
    "code": "CHAT_NOT_FOUND",
    "message": "Chat with ID chat_123 not found",
    "status": 404
  }
}
```

### Common Error Codes
- `CHAT_NOT_FOUND` - Chat does not exist
- `LABEL_NOT_FOUND` - Label does not exist
- `STAFF_NOT_FOUND` - Staff member does not exist
- `INVALID_PHONE` - Invalid phone number format
- `PHONE_NOT_REGISTERED` - Phone not registered on WhatsApp
- `UNAUTHORIZED` - User not authorized for this action
- `VALIDATION_ERROR` - Request validation failed

---

## Notes for Backend Developer

1. **Snooze Background Job**: Implement a cron job or scheduler that runs every minute to check for expired snoozes and move chats back to active.

2. **Auto-Unarchive**: When receiving a webhook for new incoming message, check if the chat is archived and automatically unarchive it.

3. **Role-Based Stats**: Filter statistics based on user role. Use the existing RBAC system.

4. **Internal Notes**: These are NEVER sent to the customer. They are internal team notes only.

5. **Phone Validation**: Use the Evolution API's `checkWhatsAppNumber` endpoint to validate if a number is registered on WhatsApp.

6. **Mentions**: Parse @mentions from note content and extract staff IDs. Optionally send notifications to mentioned staff.

7. **Chat Counts**: Always return counts for active, archived, and snoozed chats in the response for the tabs UI.
