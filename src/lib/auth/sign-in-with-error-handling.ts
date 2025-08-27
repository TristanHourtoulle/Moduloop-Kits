import { signIn } from "@/lib/auth-client";

// Interface pour gérer les erreurs de Better Auth
interface SignInResult {
  success: boolean;
  error?: string;
  data?: any;
}

export async function signInWithErrorHandling(
  email: string, 
  password: string
): Promise<SignInResult> {
  // Intercepter les appels réseau pour capturer les 401
  const originalFetch = window.fetch;
  let capturedError: string | null = null;
  let capturedStatus: number | null = null;

  // Remplacer temporairement fetch pour capturer les erreurs
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await originalFetch(input, init);
    
    // Vérifier si c'est notre appel auth et si il y a une erreur
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/api/auth/sign-in/email')) {
      capturedStatus = response.status;
      
      if (!response.ok) {
        // Lire le body de l'erreur
        const clonedResponse = response.clone();
        try {
          const errorText = await clonedResponse.text();
          capturedError = errorText;
          console.log("🔴 Captured auth error:", { status: response.status, error: errorText });
        } catch (e) {
          capturedError = `HTTP ${response.status}`;
        }
      }
    }
    
    return response;
  };

  try {
    console.log("🔵 Signing in with interceptor...");
    
    const result = await signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });

    console.log("🔵 Better Auth result:", result);

    // Si nous avons capturé une erreur HTTP
    if (capturedError && capturedStatus && capturedStatus >= 400) {
      console.log("🔴 Returning captured error");
      return {
        success: false,
        error: capturedStatus === 401 ? "Credential account not found" : capturedError
      };
    }

    // Vérifier le résultat de Better Auth
    if (result && typeof result === 'object' && 'error' in result && result.error) {
      const error = result.error;
      return {
        success: false,
        error: typeof error === 'string' ? error : (error as any)?.message || 'Authentication failed'
      };
    }

    if (result && typeof result === 'object' && 'success' in result && result.success === false) {
      return {
        success: false,
        error: "Authentication failed"
      };
    }

    // Si pas d'erreur détectée, considérer comme un succès
    return {
      success: true,
      data: result
    };

  } catch (error: any) {
    console.log("🔴 Caught exception:", error);
    
    // Vérifier si c'est une erreur HTTP que nous avons capturée
    if (capturedError) {
      return {
        success: false,
        error: capturedStatus === 401 ? "Credential account not found" : capturedError
      };
    }

    return {
      success: false,
      error: error.message || error.toString()
    };
  } finally {
    // Restaurer fetch original
    window.fetch = originalFetch;
  }
}