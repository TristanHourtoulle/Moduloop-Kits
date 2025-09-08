'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, Calendar, Package, FolderOpen, Users, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/types/user';

interface UserStats {
  projectsCount: number;
  productsCount: number;
  kitsCount: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  createdAt: string;
  emailVerified: boolean;
  stats: UserStats;
}

interface UsersListProps {
  users: AdminUser[];
  onRoleUpdate: (userId: string, newRole: UserRole) => Promise<void>;
}

export function UsersList({ users, onRoleUpdate }: UsersListProps) {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800 border-red-200';
      case UserRole.DEV:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case UserRole.USER:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleRoleUpdate = async (newRole: UserRole) => {
    if (!selectedUser) return;
    
    setIsUpdating(true);
    try {
      await onRoleUpdate(selectedUser.id, newRole);
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewProjects = (userId: string) => {
    router.push(`/projects?userId=${userId}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{users.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Administrateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-red-600" />
              <span className="text-2xl font-bold text-red-600">
                {users.filter(u => u.role === UserRole.ADMIN).length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Développeurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === UserRole.DEV).length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {users.filter(u => u.role === UserRole.USER).length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Projets</TableHead>
                <TableHead>Produits</TableHead>
                <TableHead>Kits</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                      {!user.emailVerified && (
                        <Badge variant="outline" className="text-xs">
                          Email non vérifié
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">{user.stats.projectsCount}</span>
                      {user.stats.projectsCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProjects(user.id)}
                          className="h-6 w-6 p-0"
                        >
                          <FolderOpen className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.stats.productsCount}</TableCell>
                  <TableCell>{user.stats.kitsCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsRoleDialogOpen(true);
                      }}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Rôle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
            <DialogDescription>
              Modifier le rôle de {selectedUser?.name} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              defaultValue={selectedUser?.role}
              onValueChange={(value) => handleRoleUpdate(value as UserRole)}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.USER}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getRoleColor(UserRole.USER).split(' ')[0]}`} />
                    <span>Utilisateur</span>
                  </div>
                </SelectItem>
                <SelectItem value={UserRole.DEV}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getRoleColor(UserRole.DEV).split(' ')[0]}`} />
                    <span>Développeur</span>
                  </div>
                </SelectItem>
                <SelectItem value={UserRole.ADMIN}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getRoleColor(UserRole.ADMIN).split(' ')[0]}`} />
                    <span>Administrateur</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
              disabled={isUpdating}
            >
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}