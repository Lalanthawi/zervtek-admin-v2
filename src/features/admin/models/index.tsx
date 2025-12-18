'use client'

import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { ModelsTable } from './components/models-table'
import { ModelsPrimaryButtons } from './components/models-primary-buttons'
import { modelsData } from './data/models'

export function ModelsSEO() {
  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ConfigDrawer />
        </div>
        <HeaderActions />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Models SEO</h2>
            <p className='text-muted-foreground'>
              Manage SEO content for vehicle models with linked blog content.
            </p>
          </div>
          <ModelsPrimaryButtons />
        </div>

        <ModelsTable data={modelsData} />
      </Main>
    </>
  )
}
