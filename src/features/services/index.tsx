'use client'

import { useEffect, useMemo, useState } from 'react'
import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, addDays, startOfDay } from 'date-fns'
import {
  Clock,
  CheckCircle,
  Send,
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
  Languages,
  ClipboardCheck,
  User,
  Copy,
  Check,
  Car,
  Building2,
  Calendar,
  Star,
  FileText,
  Loader2,
  Upload,
  X,
  ImageIcon,
  ZoomIn,
  UserPlus,
  Users,
  Zap,
  CalendarDays,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Search } from '@/components/search'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { requests as allRequests, type ServiceRequest, type InspectionMedia, type InspectionNote } from '../requests/data/requests'
import { auctions, type Auction } from '../auctions/data/auctions'
import { cn } from '@/lib/utils'

// Inspection components
import { AssignInspectorDrawer } from './components/assign-inspector-drawer'
import { MediaUploadSection } from './components/media-upload-section'
import { InspectionNotes } from './components/inspection-notes'

// Create auction lookup map
const auctionMap = new Map(auctions.map(a => [a.id, a]))

// Get auction for a request
const getAuctionForRequest = (request: ServiceRequest): Auction | undefined => {
  if (!request.auctionId) return undefined
  return auctionMap.get(request.auctionId)
}

// Current user info
const CURRENT_USER_ID = 'admin1'
const CURRENT_USER_NAME = 'Current Admin'
const CURRENT_USER_ROLE: 'superadmin' | 'admin' | 'manager' | 'cashier' = 'admin'
const canAssignOthers = ['superadmin', 'admin', 'manager'].includes(CURRENT_USER_ROLE)

// Get all service requests (translations + inspections)
const initialRequests = allRequests.filter(r =>
  (r.type === 'translation' && r.title.includes('Auction Sheet')) || r.type === 'inspection'
)

// Status steps for translation stepper
const translationStatusSteps = [
  { key: 'pending', label: 'Requested', icon: FileText },
  { key: 'in_progress', label: 'Translating', icon: Languages },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
]

// Get time badge color based on age
const getTimeBadgeStyle = (createdAt: Date): string => {
  const diffMs = new Date().getTime() - new Date(createdAt).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days >= 14) return 'text-red-500'
  if (days >= 7) return 'text-amber-500'
  return 'text-muted-foreground'
}

// Generate visible dates centered on selected date (5 days)
const getVisibleDates = (centerDate: Date) => {
  const dates: { date: Date; label: string; dayNum: string }[] = []
  for (let i = -2; i <= 2; i++) {
    const date = addDays(centerDate, i)
    dates.push({
      date,
      label: isToday(date) ? 'Today' : isTomorrow(date) ? 'Tomorrow' : isYesterday(date) ? 'Yesterday' : format(date, 'EEE'),
      dayNum: format(date, 'd'),
    })
  }
  return dates
}

export function Services() {
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'translation' | 'inspection'>('all')
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Translation modal state
  const [replyText, setReplyText] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Inspection modal state
  const [assignDrawerOpen, setAssignDrawerOpen] = useState(false)

  const MAX_CHARACTERS = 2000
  const ITEMS_PER_PAGE = 16

  // Visible dates centered on selected date
  const visibleDates = useMemo(() => getVisibleDates(selectedDate), [selectedDate])

  // Navigate dates by number of days
  const navigateDate = (days: number) => {
    setSelectedDate(prev => addDays(prev, days))
  }

  // Get auction for selected request
  const selectedAuction = selectedRequest ? getAuctionForRequest(selectedRequest) : undefined

  // Keyboard shortcut for sending (Cmd/Ctrl + Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && isModalOpen && selectedRequest?.type === 'translation' && replyText.trim()) {
        e.preventDefault()
        handleSendTranslation()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, replyText, selectedRequest])

  // Get count for a specific date
  const getDateCount = (date: Date) => {
    return requests.filter(r => {
      // For completed: use completedAt, for pending: use createdAt or auction date
      const requestDate = r.status === 'completed' && r.completedAt
        ? startOfDay(new Date(r.completedAt))
        : r.auctionId
          ? startOfDay(new Date(getAuctionForRequest(r)?.startTime || r.createdAt))
          : startOfDay(new Date(r.createdAt))
      return requestDate.getTime() === date.getTime()
    }).length
  }

  // Filtered requests by date and type
  const filteredRequests = useMemo(() => {
    let result = [...requests]

    // Filter by selected date
    result = result.filter(r => {
      const requestDate = r.status === 'completed' && r.completedAt
        ? startOfDay(new Date(r.completedAt))
        : r.auctionId
          ? startOfDay(new Date(getAuctionForRequest(r)?.startTime || r.createdAt))
          : startOfDay(new Date(r.createdAt))
      return requestDate.getTime() === selectedDate.getTime()
    })

    // Filter by type
    if (typeFilter !== 'all') {
      result = result.filter(r => r.type === typeFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(r => {
        const auction = getAuctionForRequest(r)
        const vehicleName = auction
          ? `${auction.vehicleInfo.year} ${auction.vehicleInfo.make} ${auction.vehicleInfo.model}`
          : r.vehicleInfo
            ? `${r.vehicleInfo.year} ${r.vehicleInfo.make} ${r.vehicleInfo.model}`
            : r.title
        return (
          vehicleName.toLowerCase().includes(query) ||
          r.customerName.toLowerCase().includes(query) ||
          auction?.lotNumber.toLowerCase().includes(query) ||
          auction?.auctionHouse.toLowerCase().includes(query)
        )
      })
    }

    // Sort: pending first, then by time
    result.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1
      if (b.status === 'pending' && a.status !== 'pending') return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return result
  }, [requests, selectedDate, typeFilter, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE)
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedDate, typeFilter, searchQuery])

  // File upload handlers
  const handleFileUpload = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload an image or PDF.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.')
      return
    }
    setUploadedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    toast.success('Auction sheet uploaded successfully')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) handleFileUpload(files[0])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) handleFileUpload(files[0])
  }

  const removeUploadedFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setUploadedFile(null)
    setPreviewUrl(null)
  }

  // Card click handler
  const handleCardClick = (request: ServiceRequest) => {
    setSelectedRequest(request)
    setReplyText('')
    setCopiedField(null)
    removeUploadedFile()
    setIsModalOpen(true)
  }

  // Copy handler
  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Translation handlers
  const handleSendTranslation = async () => {
    if (!selectedRequest || !replyText.trim()) {
      toast.error('Please enter the translation before sending')
      return
    }
    setIsSending(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    const updated = requests.map((r) =>
      r.id === selectedRequest.id
        ? { ...r, status: 'completed' as const, updatedAt: new Date(), completedAt: new Date() }
        : r
    )
    setRequests(updated)
    setIsSending(false)
    setIsModalOpen(false)
    setSelectedRequest(null)
    setReplyText('')
    toast.success('Translation sent successfully!')
  }

  // Inspection handlers
  const handleAssignToMe = (request: ServiceRequest) => {
    const updated = requests.map((r) =>
      r.id === request.id
        ? { ...r, assignedTo: CURRENT_USER_ID, assignedToName: CURRENT_USER_NAME, status: 'assigned' as const }
        : r
    )
    setRequests(updated)
    setSelectedRequest({ ...request, assignedTo: CURRENT_USER_ID, assignedToName: CURRENT_USER_NAME, status: 'assigned' })
    toast.success(`Assigned to you`)
  }

  const handleAssignStaff = (staffId: string, staffName: string) => {
    if (!selectedRequest) return
    const updated = requests.map((r) =>
      r.id === selectedRequest.id
        ? { ...r, assignedTo: staffId, assignedToName: staffName, status: 'assigned' as const }
        : r
    )
    setRequests(updated)
    setSelectedRequest({ ...selectedRequest, assignedTo: staffId, assignedToName: staffName, status: 'assigned' })
  }

  const handleStartInspection = () => {
    if (!selectedRequest) return
    const updated = requests.map((r) =>
      r.id === selectedRequest.id
        ? { ...r, status: 'in_progress' as const, updatedAt: new Date() }
        : r
    )
    setRequests(updated)
    setSelectedRequest({ ...selectedRequest, status: 'in_progress', updatedAt: new Date() })
    toast.success('Inspection started')
  }

  const handleCompleteInspection = () => {
    if (!selectedRequest) return
    const updated = requests.map((r) =>
      r.id === selectedRequest.id
        ? { ...r, status: 'completed' as const, updatedAt: new Date(), completedAt: new Date() }
        : r
    )
    setRequests(updated)
    setSelectedRequest({ ...selectedRequest, status: 'completed', updatedAt: new Date(), completedAt: new Date() })
    setIsModalOpen(false)
    toast.success('Inspection completed and sent to customer')
  }

  const handleAddMedia = (newMedia: InspectionMedia[]) => {
    if (!selectedRequest) return
    const updatedMedia = [...(selectedRequest.inspectionMedia || []), ...newMedia]
    const updated = requests.map((r) =>
      r.id === selectedRequest.id ? { ...r, inspectionMedia: updatedMedia } : r
    )
    setRequests(updated)
    setSelectedRequest({ ...selectedRequest, inspectionMedia: updatedMedia })
  }

  const handleDeleteMedia = (mediaId: string) => {
    if (!selectedRequest) return
    const updatedMedia = (selectedRequest.inspectionMedia || []).filter((m) => m.id !== mediaId)
    const updated = requests.map((r) =>
      r.id === selectedRequest.id ? { ...r, inspectionMedia: updatedMedia } : r
    )
    setRequests(updated)
    setSelectedRequest({ ...selectedRequest, inspectionMedia: updatedMedia })
  }

  const handleAddNote = (note: InspectionNote) => {
    if (!selectedRequest) return
    const updatedNotes = [...(selectedRequest.inspectionNotes || []), note]
    const updated = requests.map((r) =>
      r.id === selectedRequest.id ? { ...r, inspectionNotes: updatedNotes } : r
    )
    setRequests(updated)
    setSelectedRequest({ ...selectedRequest, inspectionNotes: updatedNotes })
  }

  // Helper functions
  const getVehicleInfo = (request: ServiceRequest) => {
    const auction = getAuctionForRequest(request)
    if (auction) {
      return {
        name: `${auction.vehicleInfo.year} ${auction.vehicleInfo.make} ${auction.vehicleInfo.model}`,
        lotNo: auction.lotNumber,
        auctionHouse: auction.auctionHouse,
        time: format(new Date(auction.startTime), 'HH:mm'),
        grade: auction.vehicleInfo.grade || 'N/A',
        image: auction.vehicleInfo.images?.[1] || auction.vehicleInfo.images?.[0] || '/placeholder-car.jpg',
      }
    }
    if (request.vehicleInfo) {
      return {
        name: `${request.vehicleInfo.year} ${request.vehicleInfo.make} ${request.vehicleInfo.model}`,
        lotNo: 'N/A',
        auctionHouse: 'N/A',
        time: format(new Date(request.createdAt), 'HH:mm'),
        grade: 'N/A',
        image: '/placeholder-car.jpg',
      }
    }
    return { name: 'Unknown Vehicle', lotNo: 'N/A', auctionHouse: 'N/A', time: 'N/A', grade: 'N/A', image: '/placeholder-car.jpg' }
  }

  const getWaitTime = (createdAt: Date) => {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: false })
  }

  const getCurrentStep = (status: string) => {
    if (status === 'completed') return 2
    if (status === 'in_progress') return 1
    return 0
  }

  const getVehicleName = (request: ServiceRequest) => {
    if (request.vehicleInfo) {
      return `${request.vehicleInfo.year} ${request.vehicleInfo.make} ${request.vehicleInfo.model}`
    }
    return 'Unknown Vehicle'
  }

  const getInspectionType = (title: string) => {
    if (title.includes('Full Inspection')) return 'Full'
    if (title.includes('Pre-purchase')) return 'Pre-purchase'
    if (title.includes('Performance')) return 'Performance'
    if (title.includes('Condition')) return 'Condition'
    if (title.includes('Detailed')) return 'Detailed'
    return 'Inspection'
  }

  const getPriorityColor = (priority: ServiceRequest['priority']) => {
    const colors = { urgent: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-amber-500', low: 'bg-slate-400' }
    return colors[priority]
  }

  const getStatusVariant = (status: ServiceRequest['status']) => {
    const variants = { completed: 'emerald', in_progress: 'blue', assigned: 'violet', pending: 'amber', cancelled: 'zinc' }
    return variants[status]
  }

  return (
    <>
      <Header fixed>
        <Search className='md:w-auto flex-1' />
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 p-4 sm:p-6'>
        {/* Page Header */}
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center'>
              <CalendarDays className='h-5 w-5 text-primary' />
            </div>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>Service Tasks</h1>
              <p className='text-muted-foreground text-sm'>Translations & Inspections by day</p>
            </div>
          </div>
        </div>

        {/* Date Navigation Strip */}
        <div className='flex items-center gap-2'>
          {/* Left Arrow */}
          <Button
            variant='ghost'
            size='icon'
            onClick={() => navigateDate(-1)}
            className='h-9 w-9 shrink-0'
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>

          {/* 5 Date Buttons */}
          <div className='flex items-center gap-1.5'>
            {visibleDates.map((tab) => {
              const count = getDateCount(tab.date)
              const isSelected = tab.date.getTime() === selectedDate.getTime()
              const isTodayDate = isToday(tab.date)

              return (
                <button
                  key={tab.date.getTime()}
                  onClick={() => setSelectedDate(tab.date)}
                  className={cn(
                    'flex flex-col items-center px-4 py-2 rounded-xl transition-all min-w-[80px]',
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-muted',
                    isTodayDate && !isSelected && 'ring-2 ring-primary/30'
                  )}
                >
                  <span className={cn(
                    'text-xs font-medium',
                    isSelected ? 'text-primary-foreground' : isTodayDate ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {tab.label}
                  </span>
                  <span className={cn(
                    'text-lg font-bold',
                    isSelected ? 'text-primary-foreground' : 'text-foreground'
                  )}>
                    {tab.dayNum}
                  </span>
                  <span className={cn(
                    'text-[10px]',
                    isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground',
                    count === 0 && 'opacity-50'
                  )}>
                    ({count})
                  </span>
                </button>
              )
            })}
          </div>

          {/* Right Arrow */}
          <Button
            variant='ghost'
            size='icon'
            onClick={() => navigateDate(1)}
            className='h-9 w-9 shrink-0'
          >
            <ChevronRight className='h-4 w-4' />
          </Button>

          {/* Today Button - only shows when not viewing today */}
          {!isToday(selectedDate) && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setSelectedDate(startOfDay(new Date()))}
              className='ml-2'
            >
              Today
            </Button>
          )}
        </div>

        {/* Type Filter Tabs */}
        <div className='flex items-center gap-2'>
          <Button
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setTypeFilter('all')}
            className='rounded-full'
          >
            All
          </Button>
          <Button
            variant={typeFilter === 'translation' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setTypeFilter('translation')}
            className={cn('rounded-full gap-1.5', typeFilter === 'translation' && 'bg-blue-600 hover:bg-blue-700')}
          >
            <Languages className='h-3.5 w-3.5' />
            Translations
          </Button>
          <Button
            variant={typeFilter === 'inspection' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setTypeFilter('inspection')}
            className={cn('rounded-full gap-1.5', typeFilter === 'inspection' && 'bg-amber-600 hover:bg-amber-700')}
          >
            <ClipboardCheck className='h-3.5 w-3.5' />
            Inspections
          </Button>

          <div className='flex-1' />

          <div className='relative max-w-xs'>
            <SearchIcon className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Search...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 h-9'
            />
          </div>
        </div>

        {/* Task Grid */}
        {paginatedRequests.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
            {paginatedRequests.map((request, index) => {
              const vehicleInfo = getVehicleInfo(request)
              const isCompleted = request.status === 'completed'
              const isPending = request.status === 'pending'
              const isTranslation = request.type === 'translation'

              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={cn(
                      'relative cursor-pointer rounded-xl border-border/50 bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden',
                      isCompleted && 'opacity-60'
                    )}
                    onClick={() => handleCardClick(request)}
                  >
                    {/* Thumbnail */}
                    <div className='relative h-32 bg-muted'>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={vehicleInfo.image}
                        alt={vehicleInfo.name}
                        className='h-full w-full object-cover'
                      />
                      {/* Type badge overlay */}
                      <div className='absolute top-2 right-2 flex items-center gap-1.5'>
                        {isPending && (
                          <span className='size-2 rounded-full bg-blue-500 ring-2 ring-background' />
                        )}
                        <span className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm',
                          isTranslation
                            ? 'bg-blue-500/90 text-white'
                            : 'bg-amber-500/90 text-white'
                        )}>
                          {isTranslation ? (
                            <Languages className='h-3 w-3' />
                          ) : (
                            <ClipboardCheck className='h-3 w-3' />
                          )}
                          {isTranslation ? 'Translation' : 'Inspection'}
                        </span>
                      </div>
                    </div>

                    <CardContent className='p-4'>
                      <h3 className={cn(
                        'text-sm line-clamp-1',
                        isCompleted ? 'font-normal text-muted-foreground' : 'font-medium text-foreground'
                      )}>
                        {vehicleInfo.name}
                      </h3>

                      <div className='mt-1 flex items-center gap-1.5 text-xs text-muted-foreground'>
                        <span className='font-mono'>{vehicleInfo.lotNo}</span>
                        <span className='text-muted-foreground/40'>•</span>
                        <span className='truncate'>{vehicleInfo.auctionHouse}</span>
                      </div>

                      <div className='mt-3 flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <div className='size-6 rounded-full bg-primary/10 flex items-center justify-center'>
                            <span className='text-[10px] font-medium text-primary'>
                              {request.customerName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className='text-xs text-muted-foreground truncate max-w-[70px]'>
                            {request.customerName.split(' ')[0]}
                          </span>
                        </div>
                        {isCompleted ? (
                          <Badge variant='emerald' className='text-[10px]'>
                            <CheckCircle className='h-3 w-3 mr-1' />
                            Done
                          </Badge>
                        ) : (
                          <span className={cn('flex items-center gap-1 text-xs', getTimeBadgeStyle(request.createdAt))}>
                            <Clock className='h-3 w-3' />
                            {getWaitTime(request.createdAt)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <Card className='rounded-xl border-dashed border-2 border-border/40 shadow-none'>
            <CardContent className='flex flex-col items-center justify-center py-20 gap-4'>
              <div className='size-20 rounded-full bg-muted/50 flex items-center justify-center'>
                <CalendarDays className='h-10 w-10 text-muted-foreground/40' />
              </div>
              <div className='text-center space-y-1'>
                <p className='text-base font-medium text-muted-foreground'>No tasks for this day</p>
                <p className='text-sm text-muted-foreground/70'>
                  {isToday(selectedDate) ? 'All caught up!' : 'Select another day to view tasks'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex items-center justify-between'>
            <p className='text-sm text-muted-foreground'>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredRequests.length)} of {filteredRequests.length}
            </p>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <span className='text-sm text-muted-foreground px-2'>
                {currentPage} / {totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}

        {/* Translation Modal */}
        {selectedRequest?.type === 'translation' && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className='!max-w-4xl !w-[90vw] p-0 gap-0 overflow-hidden'>
              <AnimatePresence mode='wait'>
                {selectedRequest && selectedAuction && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className='flex flex-col max-h-[90vh]'
                  >
                    {/* Header */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className='flex items-center justify-between px-6 py-5 border-b bg-muted/30'
                    >
                      <div className='flex items-center gap-4'>
                        <div className='h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center'>
                          <Languages className='h-6 w-6 text-blue-500' />
                        </div>
                        <div>
                          <h2 className='text-lg font-semibold'>Translation Request</h2>
                          <p className='text-sm text-muted-foreground'>
                            {selectedAuction.vehicleInfo.year} {selectedAuction.vehicleInfo.make} {selectedAuction.vehicleInfo.model}
                          </p>
                        </div>
                      </div>
                      <Badge variant={selectedRequest.status === 'completed' ? 'emerald' : 'amber'} className='text-xs'>
                        {selectedRequest.status === 'completed' ? 'Completed' : 'Pending'}
                      </Badge>
                    </motion.div>

                    {/* Status Stepper */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className='px-6 py-4 border-b flex justify-center'
                    >
                      <div className='flex items-center max-w-md w-full'>
                        {translationStatusSteps.map((step, index) => {
                          const currentStep = getCurrentStep(selectedRequest.status)
                          const isActive = index <= currentStep
                          const isCurrent = index === currentStep
                          const Icon = step.icon

                          return (
                            <div key={step.key} className='flex items-center flex-1'>
                              <div className='flex flex-col items-center gap-2'>
                                <div className={cn(
                                  'h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300',
                                  isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                                  isCurrent && 'ring-4 ring-primary/20'
                                )}>
                                  <Icon className='h-5 w-5' />
                                </div>
                                <span className={cn(
                                  'text-xs font-medium transition-colors',
                                  isActive ? 'text-foreground' : 'text-muted-foreground'
                                )}>
                                  {step.label}
                                </span>
                              </div>
                              {index < translationStatusSteps.length - 1 && (
                                <div className={cn(
                                  'flex-1 h-0.5 mx-3 transition-colors duration-300',
                                  index < currentStep ? 'bg-primary' : 'bg-muted'
                                )} />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>

                    {/* Content */}
                    <div className='flex-1 overflow-y-auto p-6 space-y-5'>
                      {/* Auction Sheet Upload */}
                      {selectedRequest.status !== 'completed' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                          <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3'>Auction Sheet</h3>
                          {!uploadedFile ? (
                            <div
                              onDrop={handleDrop}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              className={cn(
                                'relative rounded-xl border-2 border-dashed transition-all duration-200',
                                isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/30'
                              )}
                            >
                              <input
                                type='file'
                                accept='image/*,.pdf'
                                onChange={handleFileInputChange}
                                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                              />
                              <div className='flex flex-col items-center justify-center py-8 px-4'>
                                <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center mb-3 transition-colors', isDragging ? 'bg-primary/20' : 'bg-muted')}>
                                  <Upload className={cn('h-6 w-6 transition-colors', isDragging ? 'text-primary' : 'text-muted-foreground')} />
                                </div>
                                <p className='text-sm font-medium text-foreground'>{isDragging ? 'Drop file here' : 'Drag & drop auction sheet'}</p>
                                <p className='text-xs text-muted-foreground mt-1'>or click to browse • PNG, JPG, PDF up to 10MB</p>
                              </div>
                            </div>
                          ) : (
                            <div className='relative rounded-xl border bg-card overflow-hidden'>
                              <div className='relative group'>
                                {uploadedFile.type.startsWith('image/') ? (
                                  <div className='relative aspect-video bg-muted/30'>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={previewUrl || ''} alt='Auction sheet preview' className='w-full h-full object-contain' />
                                    <div className='absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center'>
                                      <button onClick={() => setIsPreviewOpen(true)} className='opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-black p-3 rounded-full shadow-lg'>
                                        <ZoomIn className='h-5 w-5' />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className='aspect-video bg-muted/30 flex items-center justify-center'>
                                    <div className='text-center'>
                                      <FileText className='h-12 w-12 text-muted-foreground mx-auto mb-2' />
                                      <p className='text-sm text-muted-foreground'>PDF Document</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className='flex items-center justify-between p-3 border-t bg-muted/20'>
                                <div className='flex items-center gap-2 min-w-0'>
                                  <ImageIcon className='h-4 w-4 text-muted-foreground shrink-0' />
                                  <span className='text-sm text-foreground truncate'>{uploadedFile.name}</span>
                                  <span className='text-xs text-muted-foreground shrink-0'>({(uploadedFile.size / 1024).toFixed(0)} KB)</span>
                                </div>
                                <button onClick={removeUploadedFile} className='text-muted-foreground hover:text-red-500 transition-colors p-1 rounded hover:bg-red-500/10'>
                                  <X className='h-4 w-4' />
                                </button>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Vehicle Details Card */}
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className='rounded-xl border bg-card p-5'>
                        <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4'>Vehicle Details</h3>
                        <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                          <div className='space-y-1'>
                            <div className='flex items-center gap-2 text-muted-foreground'>
                              <Building2 className='h-4 w-4' />
                              <span className='text-xs'>Lot Number</span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <span className='font-mono font-semibold'>{selectedAuction.lotNumber}</span>
                              <button onClick={() => handleCopy(selectedAuction.lotNumber, 'lot')} className='text-muted-foreground hover:text-foreground transition-colors'>
                                {copiedField === 'lot' ? <Check className='h-3.5 w-3.5 text-emerald-500' /> : <Copy className='h-3.5 w-3.5' />}
                              </button>
                            </div>
                          </div>
                          <div className='space-y-1'>
                            <div className='flex items-center gap-2 text-muted-foreground'>
                              <Building2 className='h-4 w-4' />
                              <span className='text-xs'>Auction House</span>
                            </div>
                            <span className='font-semibold'>{selectedAuction.auctionHouse}</span>
                          </div>
                          <div className='space-y-1'>
                            <div className='flex items-center gap-2 text-muted-foreground'>
                              <Calendar className='h-4 w-4' />
                              <span className='text-xs'>Date</span>
                            </div>
                            <span className='font-semibold'>{format(new Date(selectedAuction.startTime), 'MMM d, yyyy')}</span>
                          </div>
                          <div className='space-y-1'>
                            <div className='flex items-center gap-2 text-muted-foreground'>
                              <Star className='h-4 w-4' />
                              <span className='text-xs'>Grade</span>
                            </div>
                            <span className='font-semibold'>{selectedAuction.vehicleInfo.grade || 'N/A'}</span>
                          </div>
                          <div className='space-y-1'>
                            <div className='flex items-center gap-2 text-muted-foreground'>
                              <Clock className='h-4 w-4' />
                              <span className='text-xs'>Ending Time</span>
                            </div>
                            <span className='font-semibold'>{format(new Date(selectedAuction.endTime || selectedAuction.startTime), 'HH:mm')}</span>
                          </div>
                          <div className='space-y-1'>
                            <div className='flex items-center gap-2 text-muted-foreground'>
                              <User className='h-4 w-4' />
                              <span className='text-xs'>Customer</span>
                            </div>
                            <span className='font-semibold'>{selectedRequest.customerName}</span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Translation Section */}
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        {selectedRequest.status === 'completed' ? (
                          <div className='rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5'>
                            <div className='flex items-center gap-3'>
                              <div className='h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center'>
                                <CheckCircle className='h-5 w-5 text-emerald-600' />
                              </div>
                              <div>
                                <span className='font-semibold text-emerald-700 dark:text-emerald-400'>Translation Completed</span>
                                <p className='text-sm text-muted-foreground'>This translation has been sent to the customer.</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className='space-y-3'>
                            <div className='flex items-center justify-between'>
                              <h3 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Translation</h3>
                              <span className='text-xs text-muted-foreground flex items-center gap-1'>
                                <Clock className='h-3 w-3' />
                                Waiting {getWaitTime(selectedRequest.createdAt)}
                              </span>
                            </div>
                            <div className='relative'>
                              <Textarea
                                placeholder='Enter your translation here...'
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value.slice(0, MAX_CHARACTERS))}
                                className='min-h-[180px] resize-none rounded-xl bg-muted/30 border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'
                                autoFocus
                              />
                            </div>
                            <div className='flex items-center justify-between text-xs text-muted-foreground'>
                              <span className='flex items-center gap-1.5'>
                                <kbd className='px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]'>⌘</kbd>
                                <span>+</span>
                                <kbd className='px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]'>Enter</kbd>
                                <span>to send</span>
                              </span>
                              <span className={cn(
                                replyText.length >= MAX_CHARACTERS * 0.8 && replyText.length < MAX_CHARACTERS && 'text-amber-500',
                                replyText.length >= MAX_CHARACTERS && 'text-red-500'
                              )}>
                                {replyText.length.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </div>

                    {/* Sticky Footer */}
                    {selectedRequest.status !== 'completed' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className='px-6 py-4 border-t bg-muted/30'>
                        <div className='flex items-center justify-end gap-3'>
                          <Button variant='outline' onClick={() => setIsModalOpen(false)}>Cancel</Button>
                          <Button onClick={handleSendTranslation} disabled={!replyText.trim() || isSending} className='min-w-[140px]'>
                            {isSending ? (
                              <>
                                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className='h-4 w-4 mr-2' />
                                Send Translation
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </DialogContent>
          </Dialog>
        )}

        {/* Inspection Modal */}
        {selectedRequest?.type === 'inspection' && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className='!max-w-5xl !w-[90vw] max-h-[90vh] overflow-hidden flex flex-col'>
              <DialogHeader className='flex-shrink-0'>
                <DialogTitle className='flex items-center gap-2'>
                  <ClipboardCheck className='h-5 w-5 text-amber-500' />
                  Inspection - {selectedRequest?.requestId}
                </DialogTitle>
              </DialogHeader>

              {selectedRequest && (
                <div className='flex-1 flex flex-col min-h-0 overflow-hidden'>
                  {/* Header Info */}
                  <div className='flex items-start justify-between gap-4 pb-4 border-b flex-shrink-0'>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <Car className='h-5 w-5 text-muted-foreground' />
                        <h3 className='font-semibold'>{getVehicleName(selectedRequest)}</h3>
                        <Badge variant={getStatusVariant(selectedRequest.status) as any}>
                          {selectedRequest.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className='flex items-center gap-3 text-sm text-muted-foreground'>
                        <span>{getInspectionType(selectedRequest.title)}</span>
                        <span>•</span>
                        <span>{selectedRequest.customerName}</span>
                        <span>•</span>
                        <Badge variant={selectedRequest.priority === 'urgent' ? 'red' : selectedRequest.priority === 'high' ? 'orange' : 'zinc' as any} className='capitalize'>
                          {selectedRequest.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 flex-shrink-0'>
                      {!selectedRequest.assignedTo && (canAssignOthers ? (
                        <>
                          <Button size='sm' variant='outline' onClick={() => handleAssignToMe(selectedRequest)}>
                            <UserPlus className='h-4 w-4 mr-1.5' />
                            My Task
                          </Button>
                          <Button size='sm' variant='outline' onClick={() => setAssignDrawerOpen(true)}>
                            <Users className='h-4 w-4 mr-1.5' />
                            Assign Staff
                          </Button>
                        </>
                      ) : (
                        <Button size='sm' variant='outline' onClick={() => handleAssignToMe(selectedRequest)}>
                          <UserPlus className='h-4 w-4 mr-1.5' />
                          Assign to Me
                        </Button>
                      ))}
                      {selectedRequest.status === 'assigned' && (
                        <Button size='sm' onClick={handleStartInspection}>
                          <Zap className='h-4 w-4 mr-1.5' />
                          Start Inspection
                        </Button>
                      )}
                      {selectedRequest.status === 'in_progress' && (
                        <Button size='sm' onClick={handleCompleteInspection}>
                          <CheckCircle className='h-4 w-4 mr-1.5' />
                          Complete & Send
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Content Area - Split View */}
                  <div className='flex-1 flex min-h-0 mt-4 gap-4 overflow-hidden'>
                    <div className='w-1/2 flex flex-col border rounded-lg overflow-hidden'>
                      <div className='p-2 border-b bg-muted/30 flex-shrink-0'>
                        <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>Inspection Media</span>
                      </div>
                      <div className='flex-1 p-4 overflow-y-auto'>
                        <MediaUploadSection
                          media={selectedRequest.inspectionMedia || []}
                          onAddMedia={handleAddMedia}
                          onDeleteMedia={handleDeleteMedia}
                          disabled={selectedRequest.status === 'completed' || selectedRequest.status === 'pending'}
                          currentUser={CURRENT_USER_NAME}
                        />
                      </div>
                    </div>
                    <div className='w-1/2 flex flex-col border rounded-lg overflow-hidden'>
                      <div className='p-2 border-b bg-muted/30 flex-shrink-0'>
                        <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>Inspection Notes</span>
                      </div>
                      <div className='flex-1 p-4 overflow-y-auto'>
                        <InspectionNotes
                          notes={selectedRequest.inspectionNotes || []}
                          onAddNote={handleAddNote}
                          disabled={selectedRequest.status === 'completed' || selectedRequest.status === 'pending'}
                          currentUser={CURRENT_USER_NAME}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Details Bar */}
                  {selectedRequest.vehicleInfo && (
                    <div className='border-t bg-muted/30 p-3 mt-4 rounded-lg flex-shrink-0'>
                      <div className='flex items-center gap-6 text-sm overflow-x-auto'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4 text-muted-foreground' />
                          <span className='text-muted-foreground'>Year:</span>
                          <span className='font-medium'>{selectedRequest.vehicleInfo.year}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-muted-foreground'>Make:</span>
                          <span className='font-medium'>{selectedRequest.vehicleInfo.make}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-muted-foreground'>Model:</span>
                          <span className='font-medium'>{selectedRequest.vehicleInfo.model}</span>
                        </div>
                        {selectedRequest.vehicleInfo.vin && (
                          <div className='flex items-center gap-2'>
                            <span className='text-muted-foreground'>VIN:</span>
                            <span className='font-mono text-xs'>{selectedRequest.vehicleInfo.vin}</span>
                          </div>
                        )}
                        {selectedRequest.assignedToName && (
                          <div className='flex items-center gap-2'>
                            <User className='h-4 w-4 text-muted-foreground' />
                            <span className='text-muted-foreground'>Assigned:</span>
                            <span className='font-medium'>{selectedRequest.assignedToName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}

        {/* Assign Inspector Drawer */}
        <AssignInspectorDrawer
          open={assignDrawerOpen}
          onOpenChange={setAssignDrawerOpen}
          request={selectedRequest}
          onAssign={handleAssignStaff}
        />

        {/* Fullscreen Image Preview Modal */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className='!max-w-[95vw] max-h-[95vh] p-0 gap-0 overflow-hidden bg-black/95 border-none'>
            <div className='relative w-full h-full flex items-center justify-center p-4'>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className='absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-10'
              >
                <X className='h-5 w-5' />
              </button>
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt='Auction sheet full preview' className='max-w-full max-h-[90vh] object-contain rounded-lg' />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </Main>
    </>
  )
}
