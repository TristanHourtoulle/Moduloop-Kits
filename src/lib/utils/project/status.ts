import { ProjectStatus } from '@/lib/types/project'

interface StatusConfig {
  color: string
  icon: string
}

const DEFAULT_STATUS_CONFIG: StatusConfig = {
  color: 'bg-gray-100 text-gray-800',
  icon: '⚪',
}

const STATUS_CONFIG: Record<ProjectStatus, StatusConfig> = {
  [ProjectStatus.ACTIF]: {
    color: 'bg-green-100 text-green-800',
    icon: '🟢',
  },
  [ProjectStatus.TERMINE]: {
    color: 'bg-blue-100 text-blue-800',
    icon: '🔵',
  },
  [ProjectStatus.EN_PAUSE]: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: '🟡',
  },
  [ProjectStatus.ARCHIVE]: {
    color: 'bg-gray-100 text-gray-800',
    icon: '⚫',
  },
}

/**
 * Get the full status configuration for a project status.
 * @param status - The project status
 * @returns Color classes and icon for the status
 */
export function getStatusConfig(status: string): StatusConfig {
  return STATUS_CONFIG[status as ProjectStatus] ?? DEFAULT_STATUS_CONFIG
}

/**
 * Get Tailwind color classes for a project status.
 * @param status - The project status
 * @returns Tailwind CSS class string
 */
export function getStatusColor(status: string): string {
  return getStatusConfig(status).color
}

/**
 * Get emoji icon for a project status.
 * @param status - The project status
 * @returns Emoji string
 */
export function getStatusIcon(status: string): string {
  return getStatusConfig(status).icon
}
