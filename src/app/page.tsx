import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Moduloop Kits</h1>
        <p className="text-xl text-gray-600 max-w-md">
          Votre boîte à outils de développement modulaire pour créer des
          applications extraordinaires
        </p>
        <div className="space-x-4">
          <Link href="/auth">
            <Button>Commencer</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Tableau de bord</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
