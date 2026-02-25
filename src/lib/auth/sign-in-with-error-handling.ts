import { signIn } from '@/lib/auth-client'

interface SignInResult {
  success: boolean
  error?: string
  data?: unknown
}

export async function signInWithErrorHandling(
  email: string,
  password: string,
): Promise<SignInResult> {
  // Intercept network calls to capture 401 errors
  const originalFetch = window.fetch
  let capturedError: string | null = null
  let capturedStatus: number | null = null

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await originalFetch(input, init)

    const url = typeof input === 'string' ? input : input.toString()
    if (url.includes('/api/auth/sign-in/email')) {
      capturedStatus = response.status

      if (!response.ok) {
        const clonedResponse = response.clone()
        try {
          const errorText = await clonedResponse.text()
          capturedError = errorText
        } catch {
          capturedError = `HTTP ${response.status}`
        }
      }
    }

    return response
  }

  try {
    const result = await signIn.email({
      email,
      password,
      callbackURL: '/dashboard',
    })

    // If we captured an HTTP error
    if (capturedError && capturedStatus && capturedStatus >= 400) {
      return {
        success: false,
        error:
          capturedStatus === 401
            ? 'Credential account not found'
            : capturedError,
      }
    }

    // Check Better Auth result
    if (
      result &&
      typeof result === 'object' &&
      'error' in result &&
      result.error
    ) {
      const error = result.error
      return {
        success: false,
        error:
          typeof error === 'string'
            ? error
            : error instanceof Error
              ? error.message
              : 'Authentication failed',
      }
    }

    if (
      result &&
      typeof result === 'object' &&
      'success' in result &&
      result.success === false
    ) {
      return {
        success: false,
        error: 'Authentication failed',
      }
    }

    return {
      success: true,
      data: result,
    }
  } catch (error: unknown) {
    if (capturedError) {
      return {
        success: false,
        error:
          capturedStatus === 401
            ? 'Credential account not found'
            : capturedError,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  } finally {
    window.fetch = originalFetch
  }
}
