import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-4xl font-bold">404 - Page non trouvée</h1>
      <p className="mt-4">Désolé, la page que vous recherchez n&apos;existe pas.</p>
      <Link
        href="/"
        className="mt-4 cursor-pointer rounded-full bg-[#30C1BD] px-4 py-2 text-white transition-colors hover:bg-[#30C1BD]/80"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
