"use client";

import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/types/user";
import { cn } from "@/lib/utils";

interface ProductCardActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export function ProductCardActions({ onEdit, onDelete, className }: ProductCardActionsProps) {
  return (
    <RoleGuard requiredRole={UserRole.DEV} showAlert={false}>
      <div className={cn("flex justify-end gap-2 pt-4 border-t border-border/50", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="h-8 px-3 border-primary/30 bg-white/80 hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
          title="Modifier le produit"
        >
          <Edit className="h-3.5 w-3.5 mr-1.5" />
          Modifier
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="h-8 px-3 border-red-200 bg-white/80 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
          title="Supprimer le produit"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Supprimer
        </Button>
      </div>
    </RoleGuard>
  );
}