'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Car,
  ChevronLeft,
  ChevronRight,
  Images,
  MapPin,
  Gauge,
  Settings,
  Fuel,
  Palette,
  Calendar,
  FileText,
  Edit,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { type Vehicle } from '../data/vehicles'

interface VehicleDetailModalProps {
  vehicle: Vehicle | null
  open: boolean
  onClose: () => void
  onCreateInvoice?: (vehicle: Vehicle) => void
  onEdit?: (vehicle: Vehicle) => void
  onDelete?: (vehicle: Vehicle) => void
  loading?: boolean
}

const statusStyles: Record<string, string> = {
  available: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  reserved: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  sold: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
}

const statusLabels: Record<string, string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="relative h-48 rounded-xl overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="flex justify-between items-center p-4 rounded-xl bg-muted/30">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2 text-right">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border/50 p-4 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="rounded-xl border border-border/50 p-4 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  )
}

function StatItem({ label, value, icon }: { label: string; value: string | React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export function VehicleDetailModal({
  vehicle,
  open,
  onClose,
  onCreateInvoice,
  onEdit,
  onDelete,
  loading = false,
}: VehicleDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Reset image index when vehicle changes
  useEffect(() => {
    if (vehicle) {
      setCurrentImageIndex(0)
    }
  }, [vehicle?.id])

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Focus trap and initial focus
  useEffect(() => {
    if (open && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [open])

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="vehicle-detail-title"
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2',
              'max-h-[90vh] overflow-hidden rounded-2xl border border-border/50',
              'bg-background shadow-2xl',
              'focus:outline-none'
            )}
          >
            {/* Close button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className={cn(
                'absolute right-4 top-4 z-20',
                'flex h-8 w-8 items-center justify-center rounded-lg',
                'bg-black/20 text-white backdrop-blur-sm transition-colors',
                'hover:bg-black/40',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
              )}
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content with scroll */}
            <div className="max-h-[90vh] overflow-y-auto">
              {loading ? (
                <div className="p-6">
                  <LoadingSkeleton />
                </div>
              ) : vehicle ? (
                <>
                  {/* Header with vehicle image gallery */}
                  <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                    {/* Main image */}
                    <div className="relative h-56">
                      {vehicle.images && vehicle.images.length > 0 ? (
                        <>
                          <Image
                            src={vehicle.images[currentImageIndex]}
                            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} - Image ${currentImageIndex + 1}`}
                            fill
                            className="object-cover"
                          />
                          {/* Navigation arrows */}
                          {vehicle.images.length > 1 && (
                            <>
                              <button
                                onClick={() => setCurrentImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length)}
                                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                                aria-label="Previous image"
                              >
                                <ChevronLeft className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => setCurrentImageIndex((prev) => (prev + 1) % vehicle.images.length)}
                                className="absolute right-12 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                                aria-label="Next image"
                              >
                                <ChevronRight className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          {/* Image counter */}
                          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                            <Images className="h-3.5 w-3.5" />
                            <span>{currentImageIndex + 1} / {vehicle.images.length}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Car className="h-20 w-20 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Thumbnail strip */}
                    {vehicle.images && vehicle.images.length > 1 && (
                      <div className="flex gap-1 overflow-x-auto p-2 bg-black/10 dark:bg-white/5">
                        {vehicle.images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={cn(
                              "flex-shrink-0 h-12 w-16 rounded overflow-hidden border-2 transition-all relative",
                              currentImageIndex === idx
                                ? "border-primary ring-1 ring-primary"
                                : "border-transparent opacity-60 hover:opacity-100"
                            )}
                          >
                            <Image
                              src={img}
                              alt={`Thumbnail ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price highlight with status */}
                  <div className="border-b border-border/50 bg-muted/30 px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</p>
                        <p className="text-3xl font-bold tracking-tight mt-1">
                          {vehicle.priceDisplay || `¥${vehicle.price.toLocaleString()}`}
                        </p>
                      </div>
                      <Badge variant="outline" className={cn('text-sm px-3 py-1', statusStyles[vehicle.status])}>
                        {statusLabels[vehicle.status]}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Vehicle Quick Stats */}
                    <div className="grid grid-cols-5 gap-3">
                      <div className="rounded-xl border border-border/50 bg-card/50 p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Stock ID</p>
                        <p className="font-semibold text-sm font-mono">{vehicle.id}</p>
                      </div>
                      <div className="rounded-xl border border-border/50 bg-card/50 p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Stock #</p>
                        <p className="font-semibold text-sm font-mono">{vehicle.stockNumber}</p>
                      </div>
                      <div className="rounded-xl border border-border/50 bg-card/50 p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Mileage</p>
                        <p className="font-semibold text-sm">{vehicle.mileageDisplay || `${vehicle.mileage.toLocaleString()} km`}</p>
                      </div>
                      <div className="rounded-xl border border-border/50 bg-card/50 p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Location</p>
                        <p className="font-semibold text-sm">{vehicle.location}</p>
                      </div>
                      <div className="rounded-xl border border-border/50 bg-card/50 p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Score</p>
                        <p className="font-semibold text-sm">{vehicle.score || '—'}</p>
                      </div>
                    </div>

                    {/* Details Grid - Two Column Layout */}
                    <div className="grid gap-4 grid-cols-2">
                      {/* Vehicle Specs */}
                      <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                          Specifications
                        </h3>
                        <div className="space-y-1 divide-y divide-border/50">
                          <StatItem label="Make" value={vehicle.make} />
                          <StatItem label="Model" value={vehicle.model} />
                          {vehicle.modelCode && (
                            <StatItem label="Model Code" value={<span className="font-mono text-xs">{vehicle.modelCode}</span>} />
                          )}
                          <StatItem
                            label="Transmission"
                            value={<span className="capitalize">{vehicle.transmission}</span>}
                            icon={<Settings className="h-3 w-3" />}
                          />
                          {vehicle.displacement && (
                            <StatItem label="Engine" value={vehicle.displacement} />
                          )}
                          <StatItem
                            label="Fuel Type"
                            value={<span className="capitalize">{vehicle.fuelType}</span>}
                            icon={<Fuel className="h-3 w-3" />}
                          />
                        </div>
                      </div>

                      {/* Condition & Location */}
                      <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                          Condition
                        </h3>
                        <div className="space-y-1 divide-y divide-border/50">
                          <StatItem
                            label="Color"
                            value={vehicle.exteriorColor}
                            icon={<Palette className="h-3 w-3" />}
                          />
                          {vehicle.grade && (
                            <StatItem label="Grade" value={vehicle.grade} />
                          )}
                          {vehicle.exteriorGrade && (
                            <StatItem label="Ext. Grade" value={vehicle.exteriorGrade} />
                          )}
                          {vehicle.interiorGrade && (
                            <StatItem label="Int. Grade" value={vehicle.interiorGrade} />
                          )}
                          <StatItem
                            label="Location"
                            value={vehicle.location}
                            icon={<MapPin className="h-3 w-3" />}
                          />
                          {vehicle.dateAvailable && (
                            <StatItem
                              label="Available"
                              value={vehicle.dateAvailable}
                              icon={<Calendar className="h-3 w-3" />}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between border-t border-border/50 px-6 py-4 bg-muted/20">
                    <div className="flex items-center gap-2 flex-wrap">
                      {vehicle.status === 'available' && onCreateInvoice && (
                        <Button size="sm" onClick={() => onCreateInvoice(vehicle)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Create Invoice
                        </Button>
                      )}
                      {onEdit && (
                        <Button size="sm" variant="ghost" onClick={() => onEdit(vehicle)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.stockNumber})? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => onDelete(vehicle)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>

                    <Button variant="ghost" onClick={onClose}>
                      Close
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
