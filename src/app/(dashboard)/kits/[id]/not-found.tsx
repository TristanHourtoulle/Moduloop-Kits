import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package2, ArrowLeft } from 'lucide-react'

export default function KitNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 w-full">
      <div className="text-center max-w-md mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
          <Package2 className="h-8 w-8 text-gray-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Kit non trouvé
        </h1>

        <p className="text-gray-600 mb-6">
          Le kit que vous recherchez n&apos;existe pas ou a été supprimé.
        </p>

        <div className="space-y-3">
          <Button asChild className="w-full bg-[#30C1BD] hover:bg-[#30C1BD]/80">
            <Link href="/kits">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste des kits
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/kits/nouveau">
              <Package2 className="h-4 w-4 mr-2" />
              Créer un nouveau kit
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
