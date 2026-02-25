import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package2, ArrowLeft } from 'lucide-react'

export default function KitNotFound() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-6">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Package2 className="h-8 w-8 text-gray-400" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">Kit non trouvé</h1>

        <p className="mb-6 text-gray-600">
          Le kit que vous recherchez n&apos;existe pas ou a été supprimé.
        </p>

        <div className="space-y-3">
          <Button asChild className="w-full bg-[#30C1BD] hover:bg-[#30C1BD]/80">
            <Link href="/kits">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste des kits
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/kits/nouveau">
              <Package2 className="mr-2 h-4 w-4" />
              Créer un nouveau kit
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
