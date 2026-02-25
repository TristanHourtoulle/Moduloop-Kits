'use client'

import { SafeAvatar } from '@/components/ui/safe-avatar'

export function AvatarExamples() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Exemples d&apos;avatars</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Avatar avec image */}
        <div className="text-center space-y-2">
          <SafeAvatar
            src="https://github.com/shadcn.png"
            name="John Doe"
            className="h-16 w-16 mx-auto"
          />
          <p className="text-sm">Avec image</p>
        </div>

        {/* Avatar sans image - initiales */}
        <div className="text-center space-y-2">
          <SafeAvatar name="Marie Dupont" className="h-16 w-16 mx-auto" />
          <p className="text-sm">Initiales (MD)</p>
        </div>

        {/* Avatar sans nom */}
        <div className="text-center space-y-2">
          <SafeAvatar className="h-16 w-16 mx-auto" />
          <p className="text-sm">Icône par défaut</p>
        </div>

        {/* Avatar avec image cassée */}
        <div className="text-center space-y-2">
          <SafeAvatar
            src="https://broken-image-url.com/image.jpg"
            name="Paul Martin"
            className="h-16 w-16 mx-auto"
          />
          <p className="text-sm">Image cassée → Initiales</p>
        </div>

        {/* Différentes couleurs selon le nom */}
        <div className="text-center space-y-2">
          <SafeAvatar name="Alice Wonder" className="h-16 w-16 mx-auto" />
          <p className="text-sm">Alice (AW)</p>
        </div>

        <div className="text-center space-y-2">
          <SafeAvatar name="Bob Builder" className="h-16 w-16 mx-auto" />
          <p className="text-sm">Bob (BB)</p>
        </div>

        <div className="text-center space-y-2">
          <SafeAvatar name="Charlie Brown" className="h-16 w-16 mx-auto" />
          <p className="text-sm">Charlie (CB)</p>
        </div>

        <div className="text-center space-y-2">
          <SafeAvatar name="Diana Prince" className="h-16 w-16 mx-auto" />
          <p className="text-sm">Diana (DP)</p>
        </div>
      </div>

      {/* Différentes tailles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Différentes tailles</h3>
        <div className="flex items-center space-x-4">
          <SafeAvatar name="Small" className="h-8 w-8" />
          <SafeAvatar name="Medium" className="h-12 w-12" />
          <SafeAvatar name="Large" className="h-16 w-16" />
          <SafeAvatar name="XL" className="h-20 w-20" />
        </div>
      </div>
    </div>
  )
}
