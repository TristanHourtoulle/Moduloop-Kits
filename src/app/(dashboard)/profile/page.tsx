import { PageHeader } from '@/components/headers/page-header';

export default function ProfilePage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 w-full'>
      <div className='max-w-7xl mx-auto px-6 py-8'>
        {/* Header Section */}
        <PageHeader title='Profil' icon='User' />

        {/* Main Content */}
        <div className='mt-8 space-y-8'>
          {/* Title Section */}
          <div className='space-y-2'>
            <h1 className='text-4xl font-bold text-gray-900'>Profil</h1>
            <p className='text-gray-600 max-w-2xl'>
              Gérez les informations de votre profil
            </p>
          </div>

          {/* Content */}
          <div className='text-center py-12'>
            <p className='text-gray-500'>Paramètres du profil à venir...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
