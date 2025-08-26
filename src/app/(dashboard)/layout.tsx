import type { Metadata } from 'next';
import { DashboardHeader } from '@/components/headers/dashboard-header';
import { DialogProvider } from '@/components/providers/dialog-provider';
import { UserProvider } from '@/components/providers/user-provider';

export const metadata: Metadata = {
  title: 'Moduloop Kits - Tableau de bord',
  description: 'Gérez votre boîte à outils de développement modulaire',
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <DashboardHeader />
      <main className='flex w-full min-h-[calc(100vh-4rem)]'>
        <DialogProvider>{children}</DialogProvider>
      </main>
    </UserProvider>
  );
}
