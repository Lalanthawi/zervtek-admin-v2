'use client'

import { motion } from 'framer-motion'
import {
  Check,
  Receipt,
  Truck,
  CreditCard,
  Wrench,
  FileText,
  Ship,
  Package,
  Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type PurchaseWorkflow } from '../../types/workflow'
import { isStageComplete, canAccessStage } from '../../utils/workflow'

const STAGES = [
  { number: 1, label: 'Purchase', icon: Receipt },
  { number: 2, label: 'Transport', icon: Truck },
  { number: 3, label: 'Payment', icon: CreditCard },
  { number: 4, label: 'Repair', icon: Wrench },
  { number: 5, label: 'Docs', icon: FileText },
  { number: 6, label: 'Booking', icon: Ship },
  { number: 7, label: 'Shipped', icon: Package },
  { number: 8, label: 'DHL', icon: Send },
]

// Container animation for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const

// Individual stage animation
const stageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

// Checkmark path animation
const checkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { type: 'spring' as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
}

interface WorkflowStepperProps {
  workflow: PurchaseWorkflow
  onStageClick: (stageNumber: number) => void
  className?: string
}

export function WorkflowStepper({
  workflow,
  onStageClick,
  className,
}: WorkflowStepperProps) {
  return (
    <div className={cn('w-full overflow-x-auto scrollbar-none', className)}>
      <motion.div
        className='flex items-center justify-between min-w-[700px] px-2'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        {STAGES.map((stage, index) => {
          const isCompleted = isStageComplete(workflow, stage.number)
          const isCurrent = workflow.currentStage === stage.number
          const isAccessible = canAccessStage(workflow, stage.number)
          const Icon = stage.icon

          return (
            <motion.div
              key={stage.number}
              className='flex items-center flex-1'
              variants={stageVariants}
            >
              {/* Stage Circle & Label */}
              <motion.button
                onClick={() => isAccessible && onStageClick(stage.number)}
                disabled={!isAccessible}
                className={cn(
                  'flex flex-col items-center gap-2 group relative',
                  isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'
                )}
                whileHover={isAccessible ? { scale: 1.08, y: -2 } : undefined}
                whileTap={isAccessible ? { scale: 0.95 } : undefined}
              >
                {/* Glow effect behind circle for current stage */}
                {isCurrent && !isCompleted && (
                  <motion.div
                    className='absolute inset-0 top-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-primary/20 blur-xl'
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                {/* Circle */}
                <motion.div
                  className={cn(
                    'relative h-12 w-12 rounded-full flex items-center justify-center transition-colors duration-300',
                    // Completed - emerald with shadow
                    isCompleted && 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30',
                    // Current - primary with animated ring
                    isCurrent && !isCompleted && 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30',
                    // Accessible but not current/completed - subtle border
                    !isCompleted && !isCurrent && isAccessible && 'bg-background border-2 border-muted-foreground/20 text-muted-foreground group-hover:border-primary/50 group-hover:text-primary group-hover:shadow-md',
                    // Inaccessible - faded
                    !isCompleted && !isCurrent && !isAccessible && 'bg-muted/30 text-muted-foreground/30'
                  )}
                  initial={false}
                  animate={
                    isCurrent && !isCompleted
                      ? {
                          boxShadow: [
                            '0 0 0 0px rgba(var(--primary-rgb, 59, 130, 246), 0.4)',
                            '0 0 0 8px rgba(var(--primary-rgb, 59, 130, 246), 0)',
                          ],
                        }
                      : {}
                  }
                  transition={
                    isCurrent && !isCompleted
                      ? {
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeOut',
                        }
                      : {}
                  }
                >
                  {/* Inner ring for current stage */}
                  {isCurrent && !isCompleted && (
                    <motion.div
                      className='absolute inset-0 rounded-full border-2 border-primary-foreground/30'
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                      style={{
                        borderTopColor: 'transparent',
                        borderRightColor: 'transparent',
                      }}
                    />
                  )}

                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 15,
                      }}
                    >
                      <svg
                        className='h-6 w-6'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth={3}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <motion.path
                          d='M5 12l5 5L20 7'
                          variants={checkVariants}
                          initial='hidden'
                          animate='visible'
                        />
                      </svg>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Icon className='h-5 w-5' />
                    </motion.div>
                  )}
                </motion.div>

                {/* Label */}
                <motion.span
                  className={cn(
                    'text-xs transition-colors whitespace-nowrap',
                    isCurrent && 'font-bold text-primary',
                    isCompleted && !isCurrent && 'font-semibold text-emerald-600 dark:text-emerald-400',
                    !isCompleted && !isCurrent && isAccessible && 'text-muted-foreground group-hover:text-foreground',
                    !isCompleted && !isCurrent && !isAccessible && 'text-muted-foreground/50'
                  )}
                >
                  {stage.label}
                </motion.span>
              </motion.button>

              {/* Connector Line */}
              {index < STAGES.length - 1 && (
                <div className='flex-1 mx-3 h-1.5 relative overflow-hidden rounded-full'>
                  {/* Background track */}
                  <div className='absolute inset-0 bg-muted' />

                  {/* Filled progress with gradient */}
                  <motion.div
                    className='absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full'
                    initial={{ width: '0%' }}
                    animate={{
                      width: isCompleted ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />

                  {/* Shimmer effect on completed lines */}
                  {isCompleted && (
                    <motion.div
                      className='absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent'
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                </div>
              )}
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
