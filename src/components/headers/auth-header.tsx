'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { LogIn, UserPlus, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function AuthHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex cursor-pointer items-center space-x-2 transition-transform hover:scale-105"
          >
            <Image
              src="/moduloop-logo-square.png"
              alt="Logo Moduloop"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-xl font-bold text-gray-900">
              Moduloop <span className="text-[#30C1BD]">Kits</span>
            </span>
          </Link>

          {/* Desktop Auth Buttons */}
          <div className="hidden items-center space-x-4 md:flex">
            <Link href="/auth/connexion" className="cursor-pointer">
              <Button
                variant="ghost"
                size="sm"
                className="cursor-pointer text-gray-600 transition-all duration-200 hover:bg-[#30C1BD]/10 hover:text-[#30C1BD]"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Connexion
              </Button>
            </Link>
            <Link href="/auth/inscription" className="cursor-pointer">
              <Button
                size="sm"
                className="cursor-pointer bg-[#30C1BD] text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-[#30C1BD]/90 hover:shadow-xl"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Inscription
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-gray-600" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`transition-all duration-300 ease-in-out md:hidden ${
            isMobileMenuOpen ? 'max-h-48 pb-4 opacity-100' : 'max-h-0 pb-0 opacity-0'
          } overflow-hidden`}
        >
          <div className="space-y-3 pt-4">
            <Link href="/auth/connexion" className="block cursor-pointer">
              <Button
                variant="ghost"
                size="sm"
                className="w-full cursor-pointer justify-start text-gray-600 transition-all duration-200 hover:bg-[#30C1BD]/10 hover:text-[#30C1BD]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Connexion
              </Button>
            </Link>
            <Link href="/auth/inscription" className="block cursor-pointer">
              <Button
                size="sm"
                className="w-full cursor-pointer bg-[#30C1BD] text-white shadow-lg transition-all duration-200 hover:bg-[#30C1BD]/90 hover:shadow-xl"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Inscription
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
