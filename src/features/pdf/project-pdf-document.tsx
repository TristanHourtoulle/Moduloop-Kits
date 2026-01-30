import { Document, Page, View, Text, Image } from '@react-pdf/renderer';
import { tw } from './tw-config';
import type { Project } from '@/lib/types/project';
import { calculateProjectPriceTotals } from '@/lib/utils/project/calculations';
import { calculateEnvironmentalSavings } from '@/lib/utils/project/calculations';
import { PdfPricingSection } from './sections/pdf-pricing-section';
import { PdfEnvironmentalSection } from './sections/pdf-environmental-section';
import { PdfKitListSection } from './sections/pdf-kit-list-section';

interface ProjectPdfDocumentProps {
  project: Project;
}

function PdfHeader({ projectName }: { projectName: string }) {
  const today = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={tw('flex-row justify-between items-center mb-4 pb-3')} fixed>
      <View style={tw('flex-row items-center')}>
        <Image
          src="/moduloop-logo.png"
          style={{ width: 120, height: 30, objectFit: 'contain' as const }}
        />
      </View>
      <Text style={tw('text-xs text-gray-400')}>
        Généré le {today}
      </Text>
    </View>
  );
}

function PdfFooter({ projectName }: { projectName: string }) {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 20,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#d1d5db',
      }}
      fixed
    >
      <Text style={{ fontSize: 8, color: '#6b7280' }}>
        Moduloop — {projectName}
      </Text>
      <Text
        style={{ fontSize: 8, color: '#6b7280' }}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}

export function ProjectPdfDocument({ project }: ProjectPdfDocumentProps) {
  const totalPrices = calculateProjectPriceTotals(project);
  const environmentalSavings = calculateEnvironmentalSavings(project);
  const totalSurface = project.totalSurface ?? 0;

  return (
    <Document>
      <Page
        size="A4"
        style={{
          ...tw('px-10 pt-10 font-sans'),
          paddingBottom: 50,
        }}
      >
        <PdfHeader projectName={project.nom} />

        {/* Separator line */}
        <View
          style={{
            ...tw('mb-6'),
            height: 2,
            backgroundColor: '#30C1BD',
          }}
        />

        {/* Title block */}
        <View style={tw('mb-6')}>
          <Text style={tw('text-2xl font-bold text-gray-900')}>
            {project.nom}
          </Text>
          {project.description && (
            <Text style={tw('text-sm text-gray-500 mt-2')}>
              {project.description}
            </Text>
          )}
        </View>

        {/* Pricing section */}
        <PdfPricingSection
          totalPrices={totalPrices}
          totalSurface={totalSurface}
        />

        {/* Environmental section */}
        <PdfEnvironmentalSection savings={environmentalSavings} />

        {/* Kit list section */}
        <PdfKitListSection projectKits={project.projectKits ?? []} />

        <PdfFooter projectName={project.nom} />
      </Page>
    </Document>
  );
}
