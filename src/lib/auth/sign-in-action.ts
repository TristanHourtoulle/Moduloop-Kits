import { signIn } from '@/lib/auth-client'
import { logger } from '@/lib/logger'

export const signInSocialAction = async ({ provider }: { provider: 'google' }) => {
  try {
    await signIn.social({
      provider,
      callbackURL: '/dashboard',
    })
  } catch (error) {
    logger.error('Sign in error', { error })
  }
}
