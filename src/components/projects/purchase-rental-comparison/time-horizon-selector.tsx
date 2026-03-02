'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, AlertCircle } from 'lucide-react'
import { formatBreakEvenDuration } from '@/lib/utils/project/calculations'
import { ABSOLUTE_MAX_HORIZON } from './constants'

interface TimeHorizonSelectorProps {
  timeHorizons: number[]
  selectedTimeHorizon: number
  onSelect: (years: number) => void
  isBreakEvenBeyondMax: boolean
  breakEvenYears: number | null
}

/**
 * Selector for the analysis time horizon with dynamic range and break-even warning.
 * @param props - Time horizon options and selection state
 * @returns Card with horizon buttons and optional beyond-max warning
 */
export function TimeHorizonSelector({
  timeHorizons,
  selectedTimeHorizon,
  onSelect,
  isBreakEvenBeyondMax,
  breakEvenYears,
}: Readonly<TimeHorizonSelectorProps>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 p-2">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            Horizon temporel d&apos;analyse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap justify-center gap-3">
            {timeHorizons.map((years) => (
              <Button
                key={years}
                variant={selectedTimeHorizon === years ? 'default' : 'outline'}
                onClick={() => onSelect(years)}
                className={selectedTimeHorizon === years ? 'bg-purple-500 hover:bg-purple-600' : ''}
              >
                {years} an{years > 1 ? 's' : ''}
              </Button>
            ))}
          </div>
          {isBreakEvenBeyondMax && (
            <div className="flex items-center justify-center gap-2 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4" />
              <span>
                Le point d&apos;équilibre dépasse {ABSOLUTE_MAX_HORIZON} ans
                {breakEvenYears !== null && ` (${formatBreakEvenDuration(breakEvenYears * 12)})`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
