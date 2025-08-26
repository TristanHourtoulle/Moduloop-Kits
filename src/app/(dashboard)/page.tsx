'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRootPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger automatiquement vers /dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 w-full flex items-center justify-center'>
      <div className='text-center'>
        <div className='w-8 h-8 mx-auto mb-4'>
          <div className='w-8 h-8 border-2 border-[#30C1BD] border-t-transparent rounded-full animate-spin'></div>
        </div>
        <p className='text-gray-600'>Redirection...</p>
      </div>
    </div>
  );
}
