"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SafeAvatar } from "@/components/ui/safe-avatar";
import { RoleBadge } from "@/components/ui/role-badge";
import { useRole } from "@/hooks/use-role";
import { LogOut, Mail, Calendar } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { role } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user) {
      router.push("/auth/connexion");
    }
  }, [session, router]);

  if (!session?.user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 w-full">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600">
            Bienvenue sur votre tableau de bord Moduloop Kits
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations du profil</CardTitle>
              <CardDescription>Détails de votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <SafeAvatar
                  src={session.user.image}
                  name={session.user.name}
                  className="h-20 w-20"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold">
                      {session.user.name}
                    </h3>
                    <RoleBadge role={role} />
                  </div>
                  <p className="text-gray-600">{session.user.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{session.user.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Membre depuis le {new Date().toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>Gérer votre compte</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={async () => {
                  try {
                    await signOut();
                    router.push("/auth/connexion");
                    router.refresh();
                  } catch (error) {
                    console.error("Sign out error:", error);
                  }
                }}
                variant="outline"
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Se déconnecter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
