/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour Vercel
  serverExternalPackages: ['@prisma/client', 'prisma'],

  // Optimisations pour le build
  typescript: {
    // Ignorer les erreurs TypeScript pendant le build (pas recommandé en production)
    ignoreBuildErrors: false,
  },

  // Configuration des pages et routes
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
