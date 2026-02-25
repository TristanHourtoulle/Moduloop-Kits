import { signUp } from '@/lib/auth-client'
import { RegisterActionData } from '@/lib/schemas/auth'

export async function signUpAction(registerData: RegisterActionData) {
  const { email, password, firstName, name } = registerData

  await signUp.email({
    email,
    password,
    name: `${firstName} ${name}`,
    callbackURL: '/dashboard',
  })
}
