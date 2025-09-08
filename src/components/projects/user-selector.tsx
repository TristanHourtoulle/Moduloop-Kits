'use client';

import { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RoleGuard } from '@/components/auth/role-guard';
import { UserRole } from '@/lib/types/user';
import { User } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

interface SimpleUser {
  id: string;
  name: string;
  email: string;
}

interface UserSelectorProps {
  onUserChange: (userId: string) => void;
  selectedUserId?: string;
}

export function UserSelector({ onUserChange, selectedUserId }: UserSelectorProps) {
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();
  
  // Utiliser l'userId passé en props ou l'utilisateur connecté
  const currentUserId = selectedUserId || session?.user?.id || '';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (userId: string) => {
    // Mettre à jour l'URL
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (userId === session?.user?.id) {
        // Si c'est l'utilisateur connecté, supprimer le paramètre
        url.searchParams.delete('userId');
      } else {
        url.searchParams.set('userId', userId);
      }
      router.push(url.pathname + url.search);
    }
    
    // Notifier le parent
    onUserChange(userId);
  };

  const getCurrentUserName = () => {
    const user = users.find(u => u.id === currentUserId);
    if (user) {
      return user.name;
    }
    // Si pas trouvé dans la liste, utiliser les infos de session
    return session?.user?.name || session?.user?.email || 'Utilisateur actuel';
  };

  return (
    <RoleGuard requiredRole={UserRole.DEV}>
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Projets de :</span>
        </div>
        <Select 
          value={currentUserId} 
          onValueChange={handleUserChange}
          disabled={loading}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder={loading ? "Chargement..." : "Sélectionner un utilisateur"}>
              {loading ? "Chargement..." : getCurrentUserName()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </RoleGuard>
  );
}