'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'

export function ProjectsHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between border-b border-gray-200/60 pb-6"
    >
      {/* Navigation breadcrumb */}
      <div className="flex items-center space-x-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-gray-600 transition-all duration-200 hover:bg-[#30C1BD]/5 hover:text-[#30C1BD]"
        >
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tableau de bord
          </Link>
        </Button>

        <div className="h-5 w-px bg-gray-300" />

        <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
          <Package className="h-4 w-4 text-[#30C1BD]" />
          <span>Projets</span>
        </div>
      </div>
    </motion.div>
  )
}
