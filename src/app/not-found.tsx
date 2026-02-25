import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen text-center gap-3">
      <h1 className="text-4xl font-bold">404 - Page non trouvée</h1>
      <p className="mt-4">
        Désolé, la page que vous recherchez n&apos;existe pas.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-full bg-[#30C1BD] text-white cursor-pointer hover:bg-[#30C1BD]/80 transition-colors py-2 px-4"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
