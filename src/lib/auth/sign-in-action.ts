import { signIn } from '@/lib/auth-client'

export const signInSocialAction = async ({ provider }: { provider: 'google' }) => {
  try {
    await signIn.social({
      provider,
      callbackURL: '/dashboard',
    })
  } catch (error) {
    console.error('Sign in error:', error)
  }
}
