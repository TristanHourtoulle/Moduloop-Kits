import { createTw } from 'react-pdf-tailwind';
import { ceilPrice } from '@/lib/utils/product-helpers';

export const tw = createTw({
  colors: {
    brand: '#30C1BD',
    'brand-dark': '#2AADA9',
    'gray-50': '#f9fafb',
    'gray-100': '#f3f4f6',
    'gray-200': '#e5e7eb',
    'gray-300': '#d1d5db',
    'gray-400': '#9ca3af',
    'gray-500': '#6b7280',
    'gray-600': '#4b5563',
    'gray-700': '#374151',
    'gray-800': '#1f2937',
    'gray-900': '#111827',
    'env-co2': '#FE9E58',
    'env-ressources': '#FE5858',
    'env-acidification': '#55D789',
    'env-eutrophisation': '#55D789',
  },
  fontFamily: {
    sans: ['Helvetica'],
  },
});

/**
 * PDF-safe price formatter.
 * Intl.NumberFormat('fr-FR') uses U+202F (narrow no-break space) as thousands
 * separator, which Helvetica cannot render in @react-pdf/renderer.
 * This replaces all non-ASCII whitespace with a regular space.
 */
export function formatPricePdf(price: number | null): string {
  if (price === null) return 'N/A';
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(ceilPrice(price));
  return formatted.replace(/[\u00A0\u202F]/g, ' ');
}
