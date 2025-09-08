"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/ui/role-badge";
import { useRole } from "@/hooks/use-role";
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
} from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from '@/components/providers/user-provider';

const navigationItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: Home },
  { href: "/projects", label: "Projets", icon: FolderOpen },
  { href: "/kits", label: "Kits", icon: Package },
  { href: "/products", label: "Produits", icon: ShoppingCart },
  { href: "/profile", label: "Profil", icon: User },
];

export function DashboardHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const { user } = useUser();
  const { role, isDevOrAdmin } = useRole();
  const pathname = usePathname();
  const router = useRouter();
  
  // Use user from UserProvider if available, otherwise fallback to session
  const displayUser = user || session?.user;

  // Debug: Log user data
  React.useEffect(() => {
    if (session?.user) {
      console.log("🔵 User data:", session.user);
      console.log("🔵 User image:", session.user.image);
    }
  }, [session]);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Force redirect to auth page after sign out
      router.push("/auth/connexion");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b glass shadow-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 transition-transform hover:scale-105 cursor-pointer"
          >
            <Image
              src="/moduloop-logo-square.png"
              alt="Logo Moduloop"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-xl font-bold text-foreground">
              Moduloop <span className="text-primary">Kits</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="cursor-pointer"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`relative transition-all duration-200 hover:scale-105 cursor-pointer ${
                      isActive
                        ? "text-primary bg-primary/10 hover:bg-primary/20"
                        : "text-muted-foreground hover:text-primary hover:bg-accent"
                    }`}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                    )}
                  </Button>
                </Link>
              );
            })}
            {/* Admin Navigation - Only for DEV and ADMIN roles */}
            {isDevOrAdmin && (
              <Link href="/admin" className="cursor-pointer">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`relative transition-all duration-200 hover:scale-105 cursor-pointer ${
                    pathname === "/admin" || pathname.startsWith("/admin/")
                      ? "text-primary bg-primary/10 hover:bg-primary/20"
                      : "text-muted-foreground hover:text-primary hover:bg-accent"
                  }`}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                  {(pathname === "/admin" || pathname.startsWith("/admin/")) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </Button>
              </Link>
            )}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <RoleBadge role={role} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-auto px-2 hover:bg-accent transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
                      {displayUser?.image && (
                        <AvatarImage
                          src={displayUser.image}
                          alt={displayUser?.name || "User"}
                        />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {displayUser?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-foreground">
                        {displayUser?.name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-32">
                        {displayUser?.email}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {displayUser?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
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
                  className="hover:bg-red-50 hover:text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100 pb-4"
              : "max-h-0 opacity-0 pb-0"
          } overflow-hidden`}
        >
          <div className="pt-4 space-y-3">
            {/* Mobile Navigation */}
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="cursor-pointer"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary hover:bg-accent"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              {/* Admin Navigation - Mobile - Only for DEV and ADMIN roles */}
              {isDevOrAdmin && (
                <Link href="/admin" className="cursor-pointer">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start transition-all duration-200 cursor-pointer ${
                      pathname === "/admin" || pathname.startsWith("/admin/")
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary hover:bg-accent"
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
            <div className="border-t pt-3 space-y-2">
              <div className="flex items-center space-x-3 px-3 py-2">
                <Avatar className="h-8 w-8">
                  {displayUser?.image && (
                    <AvatarImage
                      src={displayUser.image}
                      alt={displayUser?.name || "User"}
                    />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {displayUser?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {displayUser?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {displayUser?.email}
                  </p>
                </div>
                <div className="ml-auto">
                  <RoleBadge role={role} className="text-xs" />
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-accent cursor-pointer"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
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
  );
}
