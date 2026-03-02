import type { LucideIcon } from 'lucide-react'

const COLOR_CLASSES = {
  green: {
    heading: 'text-green-900',
    text: 'text-green-800',
    textMuted: 'text-green-700',
    icon: 'text-green-600',
    iconMuted: 'text-green-500',
  },
  blue: {
    heading: 'text-blue-900',
    text: 'text-blue-800',
    textMuted: 'text-blue-700',
    icon: 'text-blue-600',
    iconMuted: 'text-blue-500',
  },
} as const

interface AdvantageListProps {
  title: string
  items: ReadonlyArray<{ readonly icon: LucideIcon; readonly text: string }>
  colorScheme: 'green' | 'blue'
  variant?: 'default' | 'muted'
  icon: React.ReactNode
}

/**
 * Renders a list of advantages or disadvantages with color-coded icons and text.
 * @param props - Title, items, color scheme, and optional variant for muted styling
 * @returns Styled list of advantage/disadvantage items
 */
export function AdvantageList({
  title,
  items,
  colorScheme,
  variant = 'default',
  icon,
}: Readonly<AdvantageListProps>) {
  const colors = COLOR_CLASSES[colorScheme]
  const textColor = variant === 'muted' ? colors.textMuted : colors.text
  const iconColor = variant === 'muted' ? colors.iconMuted : colors.icon

  return (
    <div>
      <h4 className={`mb-3 flex items-center gap-2 font-semibold ${colors.heading}`}>
        {icon}
        {title}
      </h4>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.text} className={`flex items-center gap-3 text-sm ${textColor}`}>
            <item.icon className={`h-4 w-4 flex-shrink-0 ${iconColor}`} />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
