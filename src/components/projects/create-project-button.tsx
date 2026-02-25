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
          className="rounded-xl border-0 bg-[#30C1BD] px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#2AA9A4] hover:shadow-xl"
        >
          <Plus className="mr-2 h-5 w-5" />
          Nouveau Projet
        </Button>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
