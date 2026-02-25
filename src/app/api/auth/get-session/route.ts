import { auth } from '@/lib/auth'
import { NextRequest } from 'next/server'

// Force cette route à être dynamique
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return Response.json({ user: null }, { status: 200 })
    }

    return Response.json({ user: session.user }, { status: 200 })
  } catch (error) {
    console.error('Session check error:', error)
    return Response.json({ user: null }, { status: 200 })
  }
}
