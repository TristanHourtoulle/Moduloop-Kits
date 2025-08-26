'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Target, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDialog } from '@/components/providers/dialog-provider';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
}: CreateProjectModalProps) {
  const router = useRouter();
  const { showError, showSuccess } = useDialog();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    status: 'ACTIF',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const project = await response.json();
        await showSuccess('Projet créé', 'Le projet a été créé avec succès!');
        router.push(`/projects/${project.id}`);
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du projet');
      }
    } catch (error) {
      console.error('Erreur:', error);
      await showError(
        'Erreur de création',
        error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='space-y-3'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20'>
              <Target className='w-5 h-5 text-primary' />
            </div>
            <div>
              <DialogTitle className='text-lg font-semibold'>Nouveau projet</DialogTitle>
              <DialogDescription>
                Créez un projet pour organiser vos kits et produits
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className='space-y-4 mt-4'>
          <div className='space-y-2'>
            <Label htmlFor='nom'>Nom du projet *</Label>
            <Input
              id='nom'
              value={formData.nom}
              onChange={(e) => handleInputChange('nom', e.target.value)}
              placeholder='Ex: Rénovation Bureau 2024'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder='Décrivez votre projet...'
              rows={3}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='status'>Statut</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ACTIF'>Actif</SelectItem>
                <SelectItem value='EN_PAUSE'>En pause</SelectItem>
                <SelectItem value='TERMINE'>Terminé</SelectItem>
                <SelectItem value='ARCHIVE'>Archivé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              className='flex-1'
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type='submit'
              disabled={isLoading || !formData.nom.trim()}
              className='flex-1'
            >
              {isLoading ? (
                <div className='w-4 h-4 mr-2 animate-spin border-2 border-current border-t-transparent rounded-full' />
              ) : (
                <>
                  <Save className='w-4 h-4 mr-2' />
                  Créer
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
