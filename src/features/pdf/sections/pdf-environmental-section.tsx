import { View, Text } from '@react-pdf/renderer';
import { tw } from '../tw-config';
import type { EnvironmentalImpact } from '@/lib/types/project';

interface PdfEnvironmentalSectionProps {
  savings: EnvironmentalImpact;
}

const METRICS = [
  {
    key: 'rechauffementClimatique' as const,
    label: 'Réchauffement climatique',
    description: 'Économie de CO₂ vs produits neufs',
    unit: 'kg CO₂ eq.',
    color: '#FE9E58',
    bgColor: '#FEF3E8',
  },
  {
    key: 'epuisementRessources' as const,
    label: 'Épuisement des ressources',
    description: "Économie d'énergie vs produits neufs",
    unit: 'MJ',
    color: '#FE5858',
    bgColor: '#FEE8E8',
  },
  {
    key: 'acidification' as const,
    label: 'Acidification',
    description: 'Réduction acidification vs produits neufs',
    unit: 'MOL H⁺',
    color: '#55D789',
    bgColor: '#E8F8EE',
  },
  {
    key: 'eutrophisation' as const,
    label: 'Eutrophisation',
    description: 'Économie eutrophisation vs produits neufs',
    unit: 'kg P eq.',
    color: '#55D789',
    bgColor: '#E8F8EE',
  },
];

function formatMetricValue(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })
    .format(Math.abs(value))
    .replace(/[\u00A0\u202F]/g, ' ');
}

export function PdfEnvironmentalSection({ savings }: PdfEnvironmentalSectionProps) {
  return (
    <View style={tw('mb-8')}>
      <Text style={tw('text-base font-bold text-gray-800 mb-4')}>
        Impact environnemental (Location)
      </Text>

      {/* Info banner */}
      <View
        style={{
          ...tw('rounded-md py-3 px-4 mb-4'),
          backgroundColor: '#eff6ff',
          borderWidth: 1,
          borderColor: '#bfdbfe',
        }}
      >
        <Text style={tw('text-xs text-gray-700')}>
          Les données ci-dessous représentent les économies d'impact environnemental
          réalisées en choisissant la location par rapport à l'achat de produits neufs.
        </Text>
      </View>

      {/* 2x2 metric cards grid */}
      <View style={tw('flex-row flex-wrap')}>
        {METRICS.map((metric) => {
          const value = savings[metric.key];

          return (
            <View
              key={metric.key}
              style={{ width: '50%', paddingRight: 6, paddingBottom: 6 }}
            >
              <View
                style={{
                  ...tw('rounded-md p-4'),
                  backgroundColor: '#ffffff',
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                }}
              >
                {/* Header with icon dot + name */}
                <View style={tw('flex-row items-center mb-3')}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      backgroundColor: metric.bgColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 8,
                      flexShrink: 0,
                    }}
                  >
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: metric.color,
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={tw('text-xs font-bold text-gray-800')}>
                      {metric.label}
                    </Text>
                    <Text style={{ fontSize: 7, color: '#9ca3af', marginTop: 3 }}>
                      {metric.description}
                    </Text>
                  </View>
                </View>

                {/* Value */}
                <View style={tw('items-center')}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: metric.color }}>
                    {formatMetricValue(value)}
                  </Text>
                  <Text style={tw('text-xs text-gray-500 mt-1')}>
                    {metric.unit} économisés
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
