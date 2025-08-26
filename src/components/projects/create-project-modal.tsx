'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { X, Save, Sparkles, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
}: CreateProjectModalProps) {
  const router = useRouter();
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
        router.push(`/projects/${project.id}`);
        onClose();
      } else {
        throw new Error('Erreur lors de la création du projet');
      }
    } catch (error) {
      console.error('Erreur:', error);
      // TODO: Afficher une notification d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden'>
                {/* Header */}
                <div className='bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center'>
                      <Sparkles className='w-5 h-5' />
                    </div>
                    <div>
                      <h2 className='text-xl font-bold'>Nouveau Projet</h2>
                      <p className='text-blue-100 text-sm'>
                        Créez votre projet et commencez à organiser vos kits
                      </p>
                    </div>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={onClose}
                    className='absolute top-4 right-4 text-white hover:bg-white/20'
                  >
                    <X className='w-5 h-5' />
                  </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className='p-6 space-y-6'>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='nom'
                      className='text-sm font-medium text-gray-700'
                    >
                      Nom du projet *
                    </Label>
                    <Input
                      id='nom'
                      value={formData.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      placeholder='Ex: Rénovation Bureau 2024'
                      className='border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label
                      htmlFor='description'
                      className='text-sm font-medium text-gray-700'
                    >
                      Description
                    </Label>
                    <Textarea
                      id='description'
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange('description', e.target.value)
                      }
                      placeholder='Décrivez votre projet...'
                      className='border-gray-200 focus:border-blue-500 focus:ring-blue-500 min-h-[80px]'
                      rows={3}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label
                      htmlFor='status'
                      className='text-sm font-medium text-gray-700'
                    >
                      Statut
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleInputChange('status', value)
                      }
                    >
                      <SelectTrigger className='border-gray-200 focus:border-blue-500 focus:ring-blue-500'>
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

                  {/* Actions */}
                  <div className='flex space-x-3 pt-4'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={onClose}
                      className='flex-1 border-gray-200 hover:bg-gray-50'
                      disabled={isLoading}
                    >
                      Annuler
                    </Button>
                    <Button
                      type='submit'
                      disabled={isLoading || !formData.nom.trim()}
                      className='flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0'
                    >
                      {isLoading ? (
                        <Loader className='w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full' />
                      ) : (
                        // <motion.div
                        //   animate={{ rotate: 360 }}
                        //   transition={{
                        //     duration: 1,
                        //     repeat: Infinity,
                        //     ease: 'linear',
                        //   }}
                        //   className='w-4 h-4 border-2 border-white border-t-transparent rounded-full'
                        // />
                        <>
                          <Save className='w-4 h-4 mr-2' />
                          Créer
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
