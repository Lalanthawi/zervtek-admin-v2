'use client'

import { useState, useMemo } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  HelpCircle,
  Search as SearchIcon,
  MoreHorizontal,
  Eye,
  UserPlus,
  MessageSquare,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Car,
  Mail,
  Phone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  inquiries as initialInquiries,
  type Inquiry,
  type InquiryStatus,
  type InquiryType,
  inquiryTypeLabels,
  inquiryStatusLabels,
  getInquiryStats,
} from './data/inquiries'

type SortField = 'inquiryNumber' | 'customerName' | 'vehicleName' | 'createdAt' | 'status' | 'type'
type SortOrder = 'asc' | 'desc'

const salesStaff = [
  { id: 'staff-001', name: 'Mike Johnson' },
  { id: 'staff-002', name: 'Sarah Williams' },
  { id: 'staff-003', name: 'Tom Anderson' },
  { id: 'staff-004', name: 'Jessica Chen' },
]

const statusStyles: Record<InquiryStatus, string> = {
  new: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  in_progress: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  responded: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  closed: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
}

const typeStyles: Record<InquiryType, string> = {
  price: 'bg-green-500/10 text-green-600 border-green-500/20',
  availability: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  shipping: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  inspection: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  general: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
}

export function Inquiries() {
  const [inquiries, setInquiries] = useState(initialInquiries)
  const [activeTab, setActiveTab] = useState<'all' | InquiryStatus>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const stats = useMemo(() => getInquiryStats(), [])

  const filteredInquiries = useMemo(() => {
    let result = [...inquiries]

    if (activeTab !== 'all') {
      result = result.filter(i => i.status === activeTab)
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(i =>
        i.inquiryNumber.toLowerCase().includes(search) ||
        i.customerName.toLowerCase().includes(search) ||
        i.customerEmail.toLowerCase().includes(search) ||
        i.vehicleName.toLowerCase().includes(search) ||
        i.subject.toLowerCase().includes(search)
      )
    }

    if (typeFilter !== 'all') {
      result = result.filter(i => i.type === typeFilter)
    }

    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'unassigned') {
        result = result.filter(i => !i.assignedTo)
      } else {
        result = result.filter(i => i.assignedTo === assigneeFilter)
      }
    }

    result.sort((a, b) => {
      let aVal: string | number | Date
      let bVal: string | number | Date

      switch (sortField) {
        case 'inquiryNumber':
          aVal = a.inquiryNumber
          bVal = b.inquiryNumber
          break
        case 'customerName':
          aVal = a.customerName.toLowerCase()
          bVal = b.customerName.toLowerCase()
          break
        case 'vehicleName':
          aVal = a.vehicleName.toLowerCase()
          bVal = b.vehicleName.toLowerCase()
          break
        case 'createdAt':
          aVal = a.createdAt
          bVal = b.createdAt
          break
        case 'status':
          aVal = a.status
          bVal = b.status
          break
        case 'type':
          aVal = a.type
          bVal = b.type
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [inquiries, activeTab, searchTerm, typeFilter, assigneeFilter, sortField, sortOrder])

  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage)
  const paginatedInquiries = filteredInquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <>
      <Header fixed>
        <Search />
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Page Header */}
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Inquiries</h1>
            <p className='text-muted-foreground'>Manage customer inquiries</p>
          </div>
        </div>

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as typeof activeTab); setCurrentPage(1) }}>
          <TabsList>
            <TabsTrigger value='all'>
              All
              <Badge variant='secondary' className='ml-2'>{stats.total}</Badge>
            </TabsTrigger>
            <TabsTrigger value='new'>
              New
              <Badge variant='blue' className='ml-2'>{stats.new}</Badge>
            </TabsTrigger>
            <TabsTrigger value='in_progress'>
              In Progress
              <Badge variant='amber' className='ml-2'>{stats.inProgress}</Badge>
            </TabsTrigger>
            <TabsTrigger value='responded'>
              Responded
              <Badge variant='emerald' className='ml-2'>{stats.responded}</Badge>
            </TabsTrigger>
            <TabsTrigger value='closed'>
              Closed
              <Badge variant='zinc' className='ml-2'>{stats.closed}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className='mt-4 space-y-4'>
            {/* Filters */}
            <Card>
              <CardContent className='p-4'>
                <div className='flex flex-wrap items-center gap-3'>
                  <div className='relative flex-1 min-w-[200px]'>
                    <SearchIcon className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
                    <Input
                      placeholder='Search inquiries...'
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                      className='pl-10'
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1) }}>
                    <SelectTrigger className='w-[140px]'>
                      <SelectValue placeholder='Type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Types</SelectItem>
                      {Object.entries(inquiryTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={assigneeFilter} onValueChange={(v) => { setAssigneeFilter(v); setCurrentPage(1) }}>
                    <SelectTrigger className='w-[150px]'>
                      <SelectValue placeholder='Assignee' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Assignees</SelectItem>
                      <SelectItem value='unassigned'>Unassigned</SelectItem>
                      {salesStaff.map(staff => (
                        <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardContent className='p-0'>
                <div className='overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-[120px]'>
                          <Button variant='ghost' size='sm' className='-ml-3' onClick={() => toggleSort('inquiryNumber')}>
                            Inquiry # <ArrowUpDown className='ml-2 h-4 w-4' />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant='ghost' size='sm' className='-ml-3' onClick={() => toggleSort('customerName')}>
                            Customer <ArrowUpDown className='ml-2 h-4 w-4' />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant='ghost' size='sm' className='-ml-3' onClick={() => toggleSort('vehicleName')}>
                            Vehicle <ArrowUpDown className='ml-2 h-4 w-4' />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant='ghost' size='sm' className='-ml-3' onClick={() => toggleSort('type')}>
                            Type <ArrowUpDown className='ml-2 h-4 w-4' />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant='ghost' size='sm' className='-ml-3' onClick={() => toggleSort('status')}>
                            Status <ArrowUpDown className='ml-2 h-4 w-4' />
                          </Button>
                        </TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>
                          <Button variant='ghost' size='sm' className='-ml-3' onClick={() => toggleSort('createdAt')}>
                            Created <ArrowUpDown className='ml-2 h-4 w-4' />
                          </Button>
                        </TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedInquiries.length > 0 ? (
                        paginatedInquiries.map((inquiry) => (
                          <TableRow key={inquiry.id} className='cursor-pointer hover:bg-muted/50'>
                            <TableCell>
                              <span className='font-mono text-sm font-medium'>{inquiry.inquiryNumber}</span>
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <Avatar className='h-8 w-8'>
                                  <AvatarFallback className='text-xs'>
                                    {getInitials(inquiry.customerName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className='min-w-0'>
                                  <p className='text-sm font-medium truncate'>{inquiry.customerName}</p>
                                  <p className='text-xs text-muted-foreground truncate'>{inquiry.customerEmail}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <Car className='h-4 w-4 text-muted-foreground' />
                                <span className='text-sm truncate max-w-[200px]'>{inquiry.vehicleName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant='outline' className={cn('text-xs', typeStyles[inquiry.type])}>
                                {inquiryTypeLabels[inquiry.type]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant='outline' className={cn('text-xs', statusStyles[inquiry.status])}>
                                {inquiryStatusLabels[inquiry.status]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {inquiry.assignedToName ? (
                                <span className='text-sm'>{inquiry.assignedToName}</span>
                              ) : (
                                <span className='text-sm text-muted-foreground italic'>Unassigned</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className='text-sm'>
                                {formatDistanceToNow(inquiry.createdAt, { addSuffix: true })}
                              </div>
                              <div className='text-xs text-muted-foreground'>
                                {format(inquiry.createdAt, 'MMM dd, HH:mm')}
                              </div>
                            </TableCell>
                            <TableCell className='text-right'>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant='ghost' size='icon'>
                                    <MoreHorizontal className='h-4 w-4' />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Eye className='mr-2 h-4 w-4' />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <MessageSquare className='mr-2 h-4 w-4' />
                                    Respond
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <UserPlus className='mr-2 h-4 w-4' />
                                    Assign
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Mail className='mr-2 h-4 w-4' />
                                    Send Email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Phone className='mr-2 h-4 w-4' />
                                    Call Customer
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <CheckCircle className='mr-2 h-4 w-4' />
                                    Mark Responded
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <XCircle className='mr-2 h-4 w-4' />
                                    Close
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className='h-24 text-center'>
                            <div className='flex flex-col items-center justify-center'>
                              <HelpCircle className='h-8 w-8 text-muted-foreground/50 mb-2' />
                              <p className='text-muted-foreground'>No inquiries found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {filteredInquiries.length > 0 && (
                  <div className='flex items-center justify-between p-4 border-t'>
                    <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                      <span>
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                        {Math.min(currentPage * itemsPerPage, filteredInquiries.length)} of{' '}
                        {filteredInquiries.length}
                      </span>
                      <Select
                        value={String(itemsPerPage)}
                        onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1) }}
                      >
                        <SelectTrigger className='w-[70px] h-8'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='10'>10</SelectItem>
                          <SelectItem value='20'>20</SelectItem>
                          <SelectItem value='50'>50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className='h-4 w-4' />
                      </Button>
                      <span className='text-sm'>
                        Page {currentPage} of {totalPages || 1}
                      </span>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                      >
                        <ChevronRight className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
