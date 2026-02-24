import React from 'react';
import { getKits } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@/lib/types/user';
import { KitsGridClient } from './kits-grid-client';
interface KitsGridProps {
  showCreateButton?: boolean;
}

export async function KitsGrid({ showCreateButton = true }: KitsGridProps) {
  // Server-side data fetching with caching
  const kits = await getKits();

  return (
    <KitsGridClient kits={kits as React.ComponentProps<typeof KitsGridClient>['kits']} showCreateButton={showCreateButton} />
  );
}
