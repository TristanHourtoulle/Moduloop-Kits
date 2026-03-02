import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

// Force cette route à être dynamique
export const dynamic = 'force-dynamic'

export const { GET, POST } = toNextJsHandler(auth)
