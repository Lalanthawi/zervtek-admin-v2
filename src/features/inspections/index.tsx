'use client'

import { useEffect, useMemo, useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  ClipboardCheck,
  Car,
  UserPlus,
  User,
  Users,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle,
  Zap,
  Clock,
  Search as SearchIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

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
import { Search } from '@/components/search'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import {
  requests as allRequests,
  type ServiceRequest,
  type InspectionMedia,
  type InspectionNote,
} from '../requests/data/requests'
import { AssignInspectorDrawer } from './components/assign-inspector-drawer'
import { MediaUploadSection } from './components/media-upload-section'
import { InspectionNotes } from './components/inspection-notes'

const CURRENT_USER_ID = 'admin1'
const CURRENT_USER_NAME = 'Current Admin'
const CURRENT_USER_ROLE: 'superadmin' | 'admin' | 'manager' | 'cashier' = 'admin'

const canAssignOthers = ['superadmin', 'admin', 'manager'].includes(CURRENT_USER_ROLE)

// Filter to only inspection requests
const initialRequests = allRequests.filter((r) => r.type === 'inspection')

// Get days since creation for time-based styling
const getDaysOld = (createdAt: Date): number => {
  const diffMs = new Date().getTime() - new Date(createdAt).getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

// Get time badge color based on age - subtle approach
const getTimeBadgeStyle = (createdAt: Date): string => {
  const days = getDaysOld(createdAt)
  if (days >= 14) return 'text-red-500'
  if (days >= 7) return 'text-amber-500'
  return 'text-muted-foreground'
}

export function Inspections() {
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [inspectionType, setInspectionType] = useState<string>('all')
  const [showMyTasks, setShowMyTasks] = useState(false)
  const [assignDrawerOpen, setAssignDrawerOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 12

  // Compute my tasks count
  const myTasksCount = useMemo(() => {
    return requests.filter((r) => r.assignedTo === CURRENT_USER_ID).length
  }, [requests])

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch =
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.vehicleInfo?.vin?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || request.status === statusFilter
      const matchesMyTasks = !showMyTasks || request.assignedTo === CURRENT_USER_ID

      return matchesSearch && matchesStatus && matchesMyTasks
    })
  }, [requests, searchQuery, statusFilter, showMyTasks])

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE)
  const paginatedRequests = useMemo(() => {
    return filteredRequests.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    )
  }, [filteredRequests, currentPage, ITEMS_PER_PAGE])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, showMyTasks])

  const handleCardClick = (request: ServiceRequest) => {
    setSelectedRequest(request)
    setIsModalOpen(true)
  }

  const handleAssignToMe = (request: ServiceRequest) => {
    const updated = requests.map((r) =>
      r.id === request.id
        ? {
            ...r,
            assignedTo: CURRENT_USER_ID,
            assignedToName: CURRENT_USER_NAME,
            status: 'assigned' as const,
          }
        : r
    )
    setRequests(updated)
    setSelectedRequest({
      ...request,
      assignedTo: CURRENT_USER_ID,
      assignedToName: CURRENT_USER_NAME,
      status: 'assigned',
    })
    toast.success(`Inspection ${request.requestId} assigned to you`)
  }

  const handleAssignStaff = (staffId: string, staffName: string) => {
    if (!selectedRequest) return
    const updated = requests.map((r) =>
      r.id === selectedRequest.id
        ? { ...r, assignedTo: staffId, assignedToName: staffName, status: 'assigned' as const }
        : r
    )
    setRequests(updated)
    setSelectedRequest({
      ...selectedRequest,
      assignedTo: staffId,
      assignedToName: staffName,
      status: 'assigned',
    })
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
        ? {
            ...r,
            status: 'completed' as const,
            updatedAt: new Date(),
            completedAt: new Date(),
          }
        : r
    )
    setRequests(updated)
    setSelectedRequest({
      ...selectedRequest,
      status: 'completed',
      updatedAt: new Date(),
      completedAt: new Date(),
    })
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

  // Priority colors
  const getPriorityColor = (priority: ServiceRequest['priority']) => {
    const colors = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-amber-500',
      low: 'bg-slate-400',
    }
    return colors[priority]
  }

  const getPriorityVariant = (priority: ServiceRequest['priority']) => {
    const variants = {
      urgent: 'red',
      high: 'orange',
      medium: 'amber',
      low: 'zinc',
    }
    return variants[priority]
  }

  const getStatusVariant = (status: ServiceRequest['status']) => {
    const variants = {
      completed: 'emerald',
      in_progress: 'blue',
      assigned: 'violet',
      pending: 'amber',
      cancelled: 'zinc',
    }
    return variants[status]
  }

  const getWaitTime = (createdAt: Date) => {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: false })
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

  return (
    <>
      <Header fixed>
        <Search className='md:w-auto flex-1' />
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 flex-col gap-6 p-4 sm:p-6'>
        {/* Page Header */}
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center'>
              <ClipboardCheck className='h-5 w-5 text-primary' />
            </div>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>Inspection Tickets</h1>
              <p className='text-muted-foreground text-sm'>Vehicle inspection requests</p>
            </div>
          </div>
        </div>

        {/* My Tasks Filter */}
        <div className='flex items-center justify-end'>
          <Button
            variant={showMyTasks ? 'secondary' : 'outline'}
            size='sm'
            onClick={() => setShowMyTasks(!showMyTasks)}
            className='gap-1.5'
          >
            <User className='h-4 w-4' />
            My Tasks
            {myTasksCount > 0 && (
              <Badge variant='secondary' className='ml-1 h-5 min-w-5 px-1.5 text-xs'>
                {myTasksCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Search & Status Filter */}
        <div className='flex flex-wrap items-center gap-3'>
          <div className='relative flex-1 min-w-[200px] max-w-md'>
            <SearchIcon className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Search by vehicle, VIN, customer...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='assigned'>Assigned</SelectItem>
              <SelectItem value='in_progress'>In Progress</SelectItem>
              <SelectItem value='completed'>Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ticket Grid */}
        {paginatedRequests.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
            {paginatedRequests.map((request, index) => {
              const isCompleted = request.status === 'completed'
              const isPending = request.status === 'pending'

              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={cn(
                      'relative cursor-pointer rounded-xl border-border/50 bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
                      isCompleted && 'opacity-60'
                    )}
                    onClick={() => handleCardClick(request)}
                  >
                    <CardContent className='p-5'>
                      {/* Unread indicator - polished blue dot */}
                      {isPending && (
                        <span className='absolute top-4 right-4 size-2.5 rounded-full bg-blue-500 ring-2 ring-background' />
                      )}

                      {/* Vehicle Name - typography hierarchy */}
                      <div className='flex items-start justify-between gap-2'>
                        <h3 className={cn(
                          'text-sm line-clamp-1',
                          isCompleted ? 'font-normal text-muted-foreground' : 'font-medium text-foreground'
                        )}>
                          {getVehicleName(request)}
                        </h3>
                        <div
                          className={cn(
                            'w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1',
                            getPriorityColor(request.priority)
                          )}
                        />
                      </div>

                      {/* Type & Customer */}
                      <div className='mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground'>
                        <span>{getInspectionType(request.title)}</span>
                        <span className='text-muted-foreground/40'>•</span>
                        <span className='truncate'>{request.customerName}</span>
                      </div>

                      {/* Footer */}
                      <div className='mt-4 flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          {request.assignedToName ? (
                            <>
                              <div className='size-7 rounded-full bg-primary/10 flex items-center justify-center'>
                                <span className='text-xs font-medium text-primary'>
                                  {request.assignedToName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className='text-xs text-muted-foreground truncate max-w-[60px]'>
                                {request.assignedToName.split(' ')[0]}
                              </span>
                            </>
                          ) : (
                            <Badge variant='outline' className='text-[10px]'>Unassigned</Badge>
                          )}
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
                <ClipboardCheck className='h-10 w-10 text-muted-foreground/40' />
              </div>
              <div className='text-center space-y-1'>
                <p className='text-base font-medium text-muted-foreground'>No inspection tickets found</p>
                <p className='text-sm text-muted-foreground/70'>Try adjusting your search or filters</p>
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

        {/* Inspection Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className='!max-w-5xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col'>
            <DialogHeader className='flex-shrink-0'>
              <DialogTitle className='flex items-center gap-2'>
                <ClipboardCheck className='h-5 w-5' />
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
                      <Badge
                        variant={getPriorityVariant(selectedRequest.priority) as any}
                        className='capitalize'
                      >
                        {selectedRequest.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className='flex items-center gap-2 flex-shrink-0'>
                    {!selectedRequest.assignedTo &&
                      (canAssignOthers ? (
                        <>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => handleAssignToMe(selectedRequest)}
                          >
                            <UserPlus className='h-4 w-4 mr-1.5' />
                            My Task
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => setAssignDrawerOpen(true)}
                          >
                            <Users className='h-4 w-4 mr-1.5' />
                            Assign Staff
                          </Button>
                        </>
                      ) : (
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => handleAssignToMe(selectedRequest)}
                        >
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
                  {/* Media Upload Section */}
                  <div className='w-1/2 flex flex-col border rounded-lg overflow-hidden'>
                    <div className='p-2 border-b bg-muted/30 flex-shrink-0'>
                      <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                        Inspection Media
                      </span>
                    </div>
                    <div className='flex-1 p-4 overflow-y-auto'>
                      <MediaUploadSection
                        media={selectedRequest.inspectionMedia || []}
                        onAddMedia={handleAddMedia}
                        onDeleteMedia={handleDeleteMedia}
                        disabled={
                          selectedRequest.status === 'completed' ||
                          selectedRequest.status === 'pending'
                        }
                        currentUser={CURRENT_USER_NAME}
                      />
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className='w-1/2 flex flex-col border rounded-lg overflow-hidden'>
                    <div className='p-2 border-b bg-muted/30 flex-shrink-0'>
                      <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                        Inspection Notes
                      </span>
                    </div>
                    <div className='flex-1 p-4 overflow-y-auto'>
                      <InspectionNotes
                        notes={selectedRequest.inspectionNotes || []}
                        onAddNote={handleAddNote}
                        disabled={
                          selectedRequest.status === 'completed' ||
                          selectedRequest.status === 'pending'
                        }
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
                          <span className='font-mono text-xs'>
                            {selectedRequest.vehicleInfo.vin}
                          </span>
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

        {/* Assign Inspector Drawer */}
        <AssignInspectorDrawer
          open={assignDrawerOpen}
          onOpenChange={setAssignDrawerOpen}
          request={selectedRequest}
          onAssign={handleAssignStaff}
        />
      </Main>
    </>
  )
}
