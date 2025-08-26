import { redirect } from 'next/navigation';

export default function DashboardRootPage() {
  // Redirection côté serveur
  redirect('/dashboard');
}
