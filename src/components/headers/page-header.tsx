'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home, Package, Package2, User } from 'lucide-react'
import Link from 'next/link'

const iconMap = {
  Home,
  Package,
  Package2,
  User,
}

interface PageHeaderProps {
  title: string
  icon: keyof typeof iconMap
  backUrl?: string
  backLabel?: string
}

export function PageHeader({
  title,
  icon,
  backUrl = '/dashboard',
  backLabel = 'Tableau de bord',
}: PageHeaderProps) {
  const Icon = iconMap[icon]

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
          <Link href={backUrl}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backLabel}
          </Link>
        </Button>

        <div className="h-5 w-px bg-gray-300" />

        <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
          <Icon className="w-4 h-4 text-[#30C1BD]" />
          <span>{title}</span>
        </div>
      </div>
    </motion.div>
  )
}
