"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { User } from "lucide-react";

interface SafeAvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: React.ReactNode;
  className?: string;
  name?: string;
  showPlaceholder?: boolean;
}

// Fonction pour générer un placeholder coloré basé sur le nom
function getPlaceholderColor(name?: string): string {
  if (!name) return "bg-[#30C1BD]/10 text-[#30C1BD]";

  const colors = [
    "bg-blue-100 text-blue-600",
    "bg-green-100 text-green-600",
    "bg-purple-100 text-purple-600",
    "bg-pink-100 text-pink-600",
    "bg-yellow-100 text-yellow-600",
    "bg-indigo-100 text-indigo-600",
    "bg-red-100 text-red-600",
    "bg-[#30C1BD]/10 text-[#30C1BD]",
  ];

  const index = name.charCodeAt(0) % colors.length;
  return colors[index] ?? "bg-gray-100 text-gray-600";
}

// Fonction pour générer les initiales
function getInitials(name?: string): string {
  if (!name) return "U";

  const words = name.trim().split(" ");
  const firstWord = words[0] ?? "";
  const lastWord = words[words.length - 1] ?? "";
  if (words.length === 1) {
    return firstWord.charAt(0).toUpperCase();
  }

  return (firstWord.charAt(0) + lastWord.charAt(0)).toUpperCase();
}

export function SafeAvatar({
  src,
  alt,
  fallback,
  className,
  name,
  showPlaceholder = true,
}: SafeAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const shouldShowImage =
    src &&
    src.trim() !== "" &&
    !imageError &&
    (src.startsWith("http") || src.startsWith("data:"));

  const placeholderColor = getPlaceholderColor(name);
  const initials = getInitials(name);

  // Fallback par défaut si aucun n'est fourni
  const defaultFallback = showPlaceholder ? (
    <div className="flex items-center justify-center w-full h-full">
      {name ? (
        <span className="font-semibold text-sm">{initials}</span>
      ) : (
        <User className="w-1/2 h-1/2 opacity-60" />
      )}
    </div>
  ) : (
    <User className="w-1/2 h-1/2 opacity-60" />
  );

  return (
    <Avatar className={className}>
      {shouldShowImage && (
        <AvatarImage
          src={src}
          alt={alt || name || "User"}
          onError={() => setImageError(true)}
        />
      )}
      <AvatarFallback className={placeholderColor}>
        {fallback || defaultFallback}
      </AvatarFallback>
    </Avatar>
  );
}
