import { getKits } from '@/lib/db'
import { KitsGridClient } from './kits-grid-client'

interface KitsGridProps {
  showCreateButton?: boolean
}

export async function KitsGrid({ showCreateButton = true }: KitsGridProps) {
  // Server-side data fetching with caching
  const kits = await getKits()

  return <KitsGridClient kits={kits} showCreateButton={showCreateButton} />
}
