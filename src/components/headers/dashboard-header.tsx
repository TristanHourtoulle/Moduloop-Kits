'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { RoleBadge } from '@/components/ui/role-badge'
import { useRole } from '@/hooks/use-role'
import {
  Home,
  Package,
  ShoppingCart,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  FolderOpen,
  Shield,
} from 'lucide-react'
import { useState } from 'react'
import { useSession, signOut } from '@/lib/auth-client'
import { usePathname, useRouter } from 'next/navigation'
import { useUser } from '@/components/providers/user-provider'

const navigationItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: Home },
  { href: '/projects', label: 'Projets', icon: FolderOpen },
  { href: '/kits', label: 'Kits', icon: Package },
  { href: '/products', label: 'Produits', icon: ShoppingCart },
  { href: '/profile', label: 'Profil', icon: User },
]

export function DashboardHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: session } = useSession()
  const { user } = useUser()
  const { role, isDevOrAdmin } = useRole()
  const pathname = usePathname()
  const router = useRouter()

  // Use user from UserProvider if available, otherwise fallback to session
  const displayUser = user || session?.user

  const handleSignOut = async () => {
    try {
      await signOut()
      // Force redirect to auth page after sign out
      router.push('/auth/connexion')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <header className="glass shadow-soft sticky top-0 z-50 w-full border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex cursor-pointer items-center space-x-2 transition-transform hover:scale-105"
          >
            <Image
              src="/moduloop-logo-square.png"
              alt="Logo Moduloop"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-foreground text-xl font-bold">
              Moduloop <span className="text-primary">Kits</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-1 md:flex">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link key={item.href} href={item.href} className="cursor-pointer">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`relative cursor-pointer transition-all duration-200 hover:scale-105 ${
                      isActive
                        ? 'text-primary bg-primary/10 hover:bg-primary/20'
                        : 'text-muted-foreground hover:text-primary hover:bg-accent'
                    }`}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                    {isActive && (
                      <div className="bg-primary absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 transform rounded-full" />
                    )}
                  </Button>
                </Link>
              )
            })}
            {/* Admin Navigation - Only for DEV and ADMIN roles */}
            {isDevOrAdmin && (
              <Link href="/admin" className="cursor-pointer">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`relative cursor-pointer transition-all duration-200 hover:scale-105 ${
                    pathname === '/admin' || pathname.startsWith('/admin/')
                      ? 'text-primary bg-primary/10 hover:bg-primary/20'
                      : 'text-muted-foreground hover:text-primary hover:bg-accent'
                  }`}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                  {(pathname === '/admin' || pathname.startsWith('/admin/')) && (
                    <div className="bg-primary absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 transform rounded-full" />
                  )}
                </Button>
              </Link>
            )}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden items-center space-x-4 md:flex">
            <RoleBadge role={role} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hover:bg-accent group relative h-10 w-auto cursor-pointer px-2 transition-all duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <Avatar className="group-hover:ring-primary/30 h-8 w-8 ring-2 ring-transparent transition-all">
                      {displayUser?.image && (
                        <AvatarImage src={displayUser.image} alt={displayUser?.name || 'User'} />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {displayUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden text-left lg:block">
                      <p className="text-foreground text-sm font-medium">
                        {displayUser?.name || 'User'}
                      </p>
                      <p className="text-muted-foreground max-w-32 truncate text-xs">
                        {displayUser?.email}
                      </p>
                    </div>
                    <ChevronDown className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">{displayUser?.name}</p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {displayUser?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-accent hover:text-accent-foreground cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-accent hover:text-accent-foreground cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="hover:bg-accent cursor-pointer rounded-lg p-2 transition-colors md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="text-muted-foreground h-5 w-5" />
            ) : (
              <Menu className="text-muted-foreground h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`transition-all duration-300 ease-in-out md:hidden ${
            isMobileMenuOpen ? 'max-h-screen pb-4 opacity-100' : 'max-h-0 pb-0 opacity-0'
          } overflow-x-hidden overflow-y-auto`}
        >
          <div className="pb-safe space-y-3 pt-4">
            {/* Mobile Navigation */}
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link key={item.href} href={item.href} className="cursor-pointer">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-full cursor-pointer justify-start transition-all duration-200 ${
                        isActive
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-primary hover:bg-accent'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
              {/* Admin Navigation - Mobile - Only for DEV and ADMIN roles */}
              {isDevOrAdmin && (
                <Link href="/admin" className="cursor-pointer">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-full cursor-pointer justify-start transition-all duration-200 ${
                      pathname === '/admin' || pathname.startsWith('/admin/')
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-primary hover:bg-accent'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile User Section */}
            <div className="space-y-2 border-t pt-3">
              <div className="flex items-center space-x-3 px-3 py-2">
                <Avatar className="h-8 w-8">
                  {displayUser?.image && (
                    <AvatarImage src={displayUser.image} alt={displayUser?.name || 'User'} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {displayUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-foreground text-sm font-medium">{displayUser?.name}</p>
                  <p className="text-muted-foreground text-xs">{displayUser?.email}</p>
                </div>
                <div className="ml-auto">
                  <RoleBadge role={role} className="text-xs" />
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary hover:bg-accent w-full cursor-pointer justify-start"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full cursor-pointer justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  handleSignOut()
                  setIsMobileMenuOpen(false)
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
