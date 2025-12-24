'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWhatsAppUIStore } from '../../stores/whatsapp-ui-store'

interface ActiveArchivedTabsProps {
  activeCount: number
  archivedCount: number
}

export function ActiveArchivedTabs({ activeCount, archivedCount }: ActiveArchivedTabsProps) {
  const { activeTab, setActiveTab } = useWhatsAppUIStore()

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'active' | 'archived')}>
      <TabsList className='w-full'>
        <TabsTrigger value='active' className='flex-1'>
          Active
          {activeCount > 0 && (
            <span className='ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary'>
              {activeCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value='archived' className='flex-1'>
          Archived
          {archivedCount > 0 && (
            <span className='ml-1.5 rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-xs font-medium text-muted-foreground'>
              {archivedCount}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
