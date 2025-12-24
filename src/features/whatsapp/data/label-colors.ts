import type { LabelColor } from '../types'

export interface LabelColorOption {
  color: LabelColor
  name: string
  bgClass: string
  textClass: string
  dotClass: string
}

// Array of just the color names for iteration
export const LABEL_COLORS: LabelColor[] = [
  'red', 'orange', 'amber', 'green', 'teal', 'blue', 'indigo', 'purple', 'pink', 'zinc'
]

// Predefined color palette for labels (soft, subtle colors)
export const LABEL_COLOR_PALETTE: LabelColorOption[] = [
  {
    color: 'red',
    name: 'Red',
    bgClass: 'bg-red-500/10 dark:bg-red-500/20',
    textClass: 'text-red-600 dark:text-red-400',
    dotClass: 'bg-red-500',
  },
  {
    color: 'orange',
    name: 'Orange',
    bgClass: 'bg-orange-500/10 dark:bg-orange-500/20',
    textClass: 'text-orange-600 dark:text-orange-400',
    dotClass: 'bg-orange-500',
  },
  {
    color: 'amber',
    name: 'Amber',
    bgClass: 'bg-amber-500/10 dark:bg-amber-500/20',
    textClass: 'text-amber-600 dark:text-amber-400',
    dotClass: 'bg-amber-500',
  },
  {
    color: 'green',
    name: 'Green',
    bgClass: 'bg-green-500/10 dark:bg-green-500/20',
    textClass: 'text-green-600 dark:text-green-400',
    dotClass: 'bg-green-500',
  },
  {
    color: 'teal',
    name: 'Teal',
    bgClass: 'bg-teal-500/10 dark:bg-teal-500/20',
    textClass: 'text-teal-600 dark:text-teal-400',
    dotClass: 'bg-teal-500',
  },
  {
    color: 'blue',
    name: 'Blue',
    bgClass: 'bg-blue-500/10 dark:bg-blue-500/20',
    textClass: 'text-blue-600 dark:text-blue-400',
    dotClass: 'bg-blue-500',
  },
  {
    color: 'indigo',
    name: 'Indigo',
    bgClass: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    textClass: 'text-indigo-600 dark:text-indigo-400',
    dotClass: 'bg-indigo-500',
  },
  {
    color: 'purple',
    name: 'Purple',
    bgClass: 'bg-purple-500/10 dark:bg-purple-500/20',
    textClass: 'text-purple-600 dark:text-purple-400',
    dotClass: 'bg-purple-500',
  },
  {
    color: 'pink',
    name: 'Pink',
    bgClass: 'bg-pink-500/10 dark:bg-pink-500/20',
    textClass: 'text-pink-600 dark:text-pink-400',
    dotClass: 'bg-pink-500',
  },
  {
    color: 'zinc',
    name: 'Gray',
    bgClass: 'bg-zinc-500/10 dark:bg-zinc-500/20',
    textClass: 'text-zinc-600 dark:text-zinc-400',
    dotClass: 'bg-zinc-500',
  },
]

// Get color config by color name
export function getLabelColorConfig(color: LabelColor): LabelColorOption {
  return (
    LABEL_COLOR_PALETTE.find((c) => c.color === color) || LABEL_COLOR_PALETTE[LABEL_COLOR_PALETTE.length - 1]
  )
}

// Default labels for new installations
export const DEFAULT_LABELS = [
  { name: 'Lead', color: 'red' as LabelColor },
  { name: 'Support', color: 'blue' as LabelColor },
  { name: 'VIP', color: 'amber' as LabelColor },
  { name: 'Follow-up', color: 'green' as LabelColor },
  { name: 'Urgent', color: 'orange' as LabelColor },
]
