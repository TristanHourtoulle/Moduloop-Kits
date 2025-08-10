import { authClient } from "@/components/providers/auth-provider";

export const { useSession, signIn, signOut, signUp } = authClient;
