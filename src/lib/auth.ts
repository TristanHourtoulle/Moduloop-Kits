import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@/lib/db'

function buildTrustedOrigins(): string[] {
  const origins = new Set<string>()

  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000')
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (appUrl) {
    origins.add(appUrl)
  }

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) {
    origins.add(`https://${vercelUrl}`)
  }

  const vercelProjectUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercelProjectUrl) {
    origins.add(`https://${vercelProjectUrl}`)
  }

  return [...origins]
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'USER',
      },
    },
  },
  trustedOrigins: buildTrustedOrigins(),
  rateLimit: {
    window: 60,
    max: 100,
    customRules: {
      '/api/auth/sign-in/*': { window: 60, max: 10 },
      '/api/auth/sign-up/*': { window: 60, max: 5 },
      '/api/auth/forgot-password/*': { window: 60, max: 5 },
      '/api/auth/reset-password/*': { window: 60, max: 5 },
    },
    // NOTE: 'memory' storage resets on each serverless cold start (Vercel).
    // Consider Redis-backed storage when scaling beyond a single instance.
    storage: 'memory',
  },
})
