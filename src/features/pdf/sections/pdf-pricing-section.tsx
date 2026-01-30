import { View, Text } from '@react-pdf/renderer';
import { tw, formatPricePdf } from '../tw-config';
import type { ProjectPriceTotals } from '@/lib/utils/project/calculations';
import { annualToMonthly, ceilPrice } from '@/lib/utils/product-helpers';

interface PdfPricingSectionProps {
  totalPrices: ProjectPriceTotals;
  totalSurface: number;
}

const PERIODS = [
  { key: 'location1an' as const, label: '1 an' },
  { key: 'location2ans' as const, label: '2 ans' },
  { key: 'location3ans' as const, label: '3 ans' },
];

export function PdfPricingSection({ totalPrices, totalSurface }: PdfPricingSectionProps) {
  const hasSurface = totalSurface > 0;

  return (
    <View style={tw('mb-8')}>
      <Text style={tw('text-base font-bold text-gray-800 mb-4')}>
        Tarification Location
      </Text>

      {/* Table header */}
      <View
        style={{
          ...tw('flex-row py-3 px-4'),
          backgroundColor: '#30C1BD',
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
        }}
      >
        <Text style={{ ...tw('text-xs font-bold'), color: '#ffffff', width: '20%' }}>
          Durée
        </Text>
        <Text style={{ ...tw('text-xs font-bold text-right'), color: '#ffffff', width: '20%' }}>
          Prix annuel
        </Text>
        <Text style={{ ...tw('text-xs font-bold text-right'), color: '#ffffff', width: '20%' }}>
          Prix mensuel
        </Text>
        {hasSurface && (
          <>
            <Text style={{ ...tw('text-xs font-bold text-right'), color: '#ffffff', width: '20%' }}>
              Prix/m² annuel
            </Text>
            <Text style={{ ...tw('text-xs font-bold text-right'), color: '#ffffff', width: '20%' }}>
              Prix/m² mensuel
            </Text>
          </>
        )}
      </View>

      {/* Table rows */}
      {PERIODS.map((period, index) => {
        const annualPrice = totalPrices[period.key];
        const monthlyPrice = annualToMonthly(annualPrice);
        const annualPerM2 = hasSurface ? ceilPrice(annualPrice / totalSurface) : 0;
        const monthlyPerM2 = hasSurface ? ceilPrice(monthlyPrice / totalSurface) : 0;

        const isLast = index === PERIODS.length - 1;
        const rowBg = index % 2 === 0 ? '#ffffff' : '#f9fafb';

        return (
          <View
            key={period.key}
            style={{
              ...tw('flex-row py-3 px-4'),
              backgroundColor: rowBg,
              borderBottomWidth: isLast ? 0 : 1,
              borderBottomColor: '#e5e7eb',
              ...(isLast ? { borderBottomLeftRadius: 6, borderBottomRightRadius: 6 } : {}),
            }}
          >
            <Text style={{ ...tw('text-xs font-bold text-gray-800'), width: '20%' }}>
              {period.label}
            </Text>
            <Text style={{ ...tw('text-xs text-gray-800 text-right'), width: '20%' }}>
              {formatPricePdf(annualPrice)}
            </Text>
            <Text style={{ ...tw('text-xs text-gray-800 text-right'), width: '20%' }}>
              {formatPricePdf(monthlyPrice)}
            </Text>
            {hasSurface && (
              <>
                <Text style={{ ...tw('text-xs text-gray-800 text-right'), width: '20%' }}>
                  {formatPricePdf(annualPerM2)}/m²
                </Text>
                <Text style={{ ...tw('text-xs text-gray-800 text-right'), width: '20%' }}>
                  {formatPricePdf(monthlyPerM2)}/m²
                </Text>
              </>
            )}
          </View>
        );
      })}

      {hasSurface && (
        <Text style={tw('text-xs text-gray-400 mt-2')}>
          Surface totale : {totalSurface.toFixed(1)} m²
        </Text>
      )}
    </View>
  );
}
