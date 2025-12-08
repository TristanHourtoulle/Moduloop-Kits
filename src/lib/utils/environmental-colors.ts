/**
 * Standardized colors for environmental impact metrics
 * Used across the entire application for consistency
 */

export const environmentalColors = {
  // CO₂ / Réchauffement climatique - Orange
  co2: {
    rgb: 'rgb(254, 158, 88)',
    hex: '#FE9E58',
    style: { color: '#FE9E58' },
    bgStyle: { backgroundColor: '#FE9E58' },
  },
  // Ressources naturelles / Épuisement des ressources - Rouge
  ressources: {
    rgb: 'rgb(254, 88, 88)',
    hex: '#FE5858',
    style: { color: '#FE5858' },
    bgStyle: { backgroundColor: '#FE5858' },
  },
  // Acidification - Vert
  acidification: {
    rgb: 'rgb(85, 215, 137)',
    hex: '#55D789',
    style: { color: '#55D789' },
    bgStyle: { backgroundColor: '#55D789' },
  },
  // Eutrophisation - Vert (même couleur que acidification)
  eutrophisation: {
    rgb: 'rgb(85, 215, 137)',
    hex: '#55D789',
    style: { color: '#55D789' },
    bgStyle: { backgroundColor: '#55D789' },
  },
} as const;

// Tailwind CSS classes (for use in className)
// Note: These use arbitrary values which require the full color to be in the safelist or inline styles
export const environmentalTailwind = {
  co2: {
    text: 'text-[#FE9E58]',
    bg: 'bg-[#FE9E58]',
    bgLight: 'bg-[#FE9E58]/10',
    bgLighter: 'bg-[#FE9E58]/5',
    border: 'border-[#FE9E58]',
    borderLight: 'border-[#FE9E58]/20',
  },
  ressources: {
    text: 'text-[#FE5858]',
    bg: 'bg-[#FE5858]',
    bgLight: 'bg-[#FE5858]/10',
    bgLighter: 'bg-[#FE5858]/5',
    border: 'border-[#FE5858]',
    borderLight: 'border-[#FE5858]/20',
  },
  acidification: {
    text: 'text-[#55D789]',
    bg: 'bg-[#55D789]',
    bgLight: 'bg-[#55D789]/10',
    bgLighter: 'bg-[#55D789]/5',
    border: 'border-[#55D789]',
    borderLight: 'border-[#55D789]/20',
  },
  eutrophisation: {
    text: 'text-[#55D789]',
    bg: 'bg-[#55D789]',
    bgLight: 'bg-[#55D789]/10',
    bgLighter: 'bg-[#55D789]/5',
    border: 'border-[#55D789]',
    borderLight: 'border-[#55D789]/20',
  },
} as const;

// Helper function to get metric color configuration
export function getMetricColor(metric: 'co2' | 'ressources' | 'acidification' | 'eutrophisation') {
  return {
    colors: environmentalColors[metric],
    tailwind: environmentalTailwind[metric],
  };
}
