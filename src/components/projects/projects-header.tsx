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
      className="flex items-center justify-between pb-6 border-b border-gray-200/60"
    >
      {/* Navigation breadcrumb */}
      <div className="flex items-center space-x-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-[#30C1BD] hover:bg-[#30C1BD]/5 transition-all duration-200"
        >
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tableau de bord
          </Link>
        </Button>

        <div className="h-5 w-px bg-gray-300" />

        <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
          <Package className="w-4 h-4 text-[#30C1BD]" />
          <span>Projets</span>
        </div>
      </div>
    </motion.div>
  )
}
