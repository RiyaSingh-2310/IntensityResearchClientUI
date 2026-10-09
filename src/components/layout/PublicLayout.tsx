import { Outlet } from 'react-router-dom'
import { AdditionalProfilePrompt } from '@/components/profile/AdditionalProfilePrompt'
import { PublicFooter } from './PublicFooter'
import { PublicHeader } from './PublicHeader'

export function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-paper">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
      <AdditionalProfilePrompt />
    </div>
  )
}
