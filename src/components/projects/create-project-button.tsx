'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreateProjectModal } from './create-project-modal'

export function CreateProjectButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#30C1BD] hover:bg-[#2AA9A4] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-semibold rounded-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Projet
        </Button>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <CreateProjectModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
