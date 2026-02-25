export function translateAuthError(error: string | Error | unknown): string {
  const errorMessage =
    typeof error === 'string' ? error : error instanceof Error ? error.message : String(error)

  // Messages d'erreur Better Auth traduits en français
  const errorTranslations: Record<string, string> = {
    // Erreurs de connexion
    'Invalid email or password': 'Email ou mot de passe incorrect',
    'User not found': "Aucun compte n'existe avec cette adresse e-mail",
    'Wrong password': 'Mot de passe incorrect',
    'Invalid credentials': 'Identifiants incorrects',
    'Account not found': 'Aucun compte trouvé avec cette adresse e-mail',
    'Password mismatch': 'Mot de passe incorrect',
    'Credential account not found': "Aucun compte n'existe avec cette adresse e-mail",

    // Erreurs d'inscription
    'User already exists': 'Un compte existe déjà avec cette adresse e-mail',
    'Email already exists': 'Cette adresse e-mail est déjà utilisée',
    'Account already exists': 'Un compte existe déjà avec cette adresse e-mail',
    'User with this email already exists': 'Un compte existe déjà avec cette adresse e-mail',

    // Erreurs de validation
    'Email is required': "L'adresse e-mail est requise",
    'Password is required': 'Le mot de passe est requis',
    'Invalid email format': "Format d'adresse e-mail invalide",
    'Password too weak': 'Le mot de passe est trop faible',
    'Password must be at least 8 characters': 'Le mot de passe doit contenir au moins 8 caractères',

    // Erreurs OAuth
    'OAuth error': 'Erreur de connexion avec Google',
    'OAuth callback error': 'Erreur lors de la connexion avec Google',
    'User cancelled the OAuth flow': "Connexion annulée par l'utilisateur",
    'OAuth provider error': "Erreur du fournisseur d'authentification",

    // Erreurs de session
    'Session expired': 'Votre session a expiré, veuillez vous reconnecter',
    'Invalid session': 'Session invalide',
    'No active session': 'Aucune session active',

    // Erreurs de réseau
    'Network error': 'Erreur de réseau, veuillez réessayer',
    'Connection failed': 'Échec de la connexion',
    'Request timeout': "Délai d'attente dépassé",

    // Erreurs de compte Google vs Email
    'Account exists with different credential':
      "Un compte existe avec cette adresse e-mail mais utilise une méthode de connexion différente (Google au lieu d'email/mot de passe)",
    'Email already linked to Google account':
      'Cette adresse e-mail est déjà liée à un compte Google. Veuillez vous connecter avec Google.',
    'Account linked to social provider':
      "Ce compte est lié à Google. Veuillez vous connecter avec Google au lieu d'utiliser email/mot de passe.",
  }

  // Chercher une correspondance exacte d'abord
  if (errorTranslations[errorMessage]) {
    return errorTranslations[errorMessage]
  }

  // Chercher des correspondances partielles pour des messages plus complexes
  for (const [englishError, frenchError] of Object.entries(errorTranslations)) {
    if (errorMessage.toLowerCase().includes(englishError.toLowerCase())) {
      return frenchError
    }
  }

  // Gestion des erreurs qui contiennent des mots-clés spécifiques
  const lowerMessage = errorMessage.toLowerCase()

  if (lowerMessage.includes('already exists') || lowerMessage.includes('already registered')) {
    return 'Un compte existe déjà avec cette adresse e-mail'
  }

  if (lowerMessage.includes('not found') || lowerMessage.includes('user not found')) {
    return "Aucun compte n'existe avec cette adresse e-mail"
  }

  if (
    lowerMessage.includes('wrong') ||
    lowerMessage.includes('incorrect') ||
    lowerMessage.includes('invalid')
  ) {
    if (lowerMessage.includes('password')) {
      return 'Mot de passe incorrect'
    }
    if (lowerMessage.includes('email')) {
      return 'Adresse e-mail invalide'
    }
    return 'Identifiants incorrects'
  }

  if (lowerMessage.includes('oauth') || lowerMessage.includes('google')) {
    return 'Erreur de connexion avec Google. Veuillez réessayer.'
  }

  if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
    return 'Erreur de connexion. Vérifiez votre connexion internet et réessayez.'
  }

  if (lowerMessage.includes('timeout')) {
    return "Délai d'attente dépassé. Veuillez réessayer."
  }

  // Message par défaut si aucune correspondance
  return "Une erreur est survenue lors de l'authentification. Veuillez réessayer."
}

export function getSpecificAuthError(
  error: string | Error | unknown,
  context: 'signin' | 'signup' | 'google',
): string {
  const translatedError = translateAuthError(error)

  // Ajouter des contextes spécifiques selon la situation
  switch (context) {
    case 'signin':
      if (translatedError.includes("Aucun compte n'existe")) {
        return translatedError + ". Vous pouvez créer un compte en cliquant sur 'Créer un compte'."
      }
      break
    case 'signup':
      if (translatedError.includes('Un compte existe déjà')) {
        return translatedError + ". Vous pouvez vous connecter en cliquant sur 'Se connecter'."
      }
      break
    case 'google':
      // Pour les erreurs Google, on peut être plus spécifique
      break
  }

  return translatedError
}
