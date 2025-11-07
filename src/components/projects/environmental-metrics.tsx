'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  Leaf,
  Flame,
  Droplets,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  Award,
} from 'lucide-react';
import { Project } from '@/lib/types/project';
import {
  getProductEnvironmentalImpact,
  formatEnvironmentalImpact,
} from '@/lib/utils/product-helpers';

interface EnvironmentalImpact {
  rechauffementClimatique: number;
  epuisementRessources: number;
  acidification: number;
  eutrophisation: number;
}

interface EnvironmentalMetricsProps {
  project: Project;
}

const getMetricInfo = (metric: string) => {
  switch (metric) {
    case 'rechauffementClimatique':
      return {
        name: 'Réchauffement climatique',
        unit: 'kg CO₂ eq',
        description: 'Économie de CO₂ vs produits neufs',
        icon: Flame,
        color: 'text-red-500',
        formatUnit: 'kg' as const,
      };
    case 'epuisementRessources':
      return {
        name: 'Épuisement des ressources',
        unit: 'MJ',
        description: "Économie d'énergie vs produits neufs",
        icon: Zap,
        color: 'text-amber-500',
        formatUnit: 'MJ' as const,
      };
    case 'acidification':
      return {
        name: 'Acidification',
        unit: 'MOL H⁺',
        description: 'Réduction acidification vs produits neufs',
        icon: Droplets,
        color: 'text-blue-500',
        formatUnit: 'MOL' as const,
      };
    case 'eutrophisation':
      return {
        name: 'Eutrophisation',
        unit: 'kg P eq',
        description: 'Économie eutrophisation vs produits neufs',
        icon: Leaf,
        color: 'text-green-500',
        formatUnit: 'kg' as const,
      };
    default:
      return {
        name: 'Métrique',
        unit: 'unit',
        description: 'Description',
        icon: Info,
        color: 'text-gray-500',
        formatUnit: 'kg' as const,
      };
  }
};

// Calcul des économies environnementales (location vs neuf)
const calculateEnvironmentalSavings = (
  project: Project
): EnvironmentalImpact => {
  if (!project.projectKits) {
    return {
      rechauffementClimatique: 0,
      epuisementRessources: 0,
      acidification: 0,
      eutrophisation: 0,
    };
  }

  let totalSavingsRechauffementClimatique = 0;
  let totalSavingsEpuisementRessources = 0;
  let totalSavingsAcidification = 0;
  let totalSavingsEutrophisation = 0;

  project.projectKits.forEach((projectKit) => {
    const kit = projectKit.kit;
    if (!kit || !kit.kitProducts) return;

    kit.kitProducts.forEach((kitProduct) => {
      const product = kitProduct.product;
      if (product) {
        // Les valeurs location dans la DB sont déjà des économies (valeurs positives)
        // Elles représentent l'impact économisé en location vs achat neuf
        const locationImpact = getProductEnvironmentalImpact(
          product,
          'location'
        );

        const totalQuantity = kitProduct.quantite * projectKit.quantite;

        // Les valeurs sont déjà des économies, on les utilise directement
        // On prend la valeur absolue pour s'assurer qu'elles sont positives
        totalSavingsRechauffementClimatique +=
          Math.abs(locationImpact.rechauffementClimatique || 0) * totalQuantity;
        totalSavingsEpuisementRessources +=
          Math.abs(locationImpact.epuisementRessources || 0) * totalQuantity;
        totalSavingsAcidification +=
          Math.abs(locationImpact.acidification || 0) * totalQuantity;
        totalSavingsEutrophisation +=
          Math.abs(locationImpact.eutrophisation || 0) * totalQuantity;
      }
    });
  });

  return {
    rechauffementClimatique: totalSavingsRechauffementClimatique,
    epuisementRessources: totalSavingsEpuisementRessources,
    acidification: totalSavingsAcidification,
    eutrophisation: totalSavingsEutrophisation,
  };
};

const getSavingsLevel = (value: number) => {
  if (value >= 500) {
    return {
      level: 'high',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      icon: Award,
      label: 'Excellent',
    };
  } else if (value >= 100) {
    return {
      level: 'medium',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
      icon: CheckCircle,
      label: 'Bon',
    };
  } else {
    return {
      level: 'low',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300',
      icon: Info,
      label: 'Modéré',
    };
  }
};

export function EnvironmentalMetrics({ project }: EnvironmentalMetricsProps) {
  const savings = calculateEnvironmentalSavings(project);
  const metrics = Object.entries(savings);

  return (
    <div className='space-y-8'>
      {/* Message d'information sur la location uniquement */}
      <div className='bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-2xl p-6'>
        <div className='flex items-start space-x-4'>
          <div className='p-3 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl'>
            <Info className='w-6 h-6 text-blue-600' />
          </div>
          <div>
            <h3 className='text-lg font-bold text-blue-900 mb-2'>
              Impact environnemental en mode location
            </h3>
            <p className='text-sm text-blue-800 leading-relaxed'>
              Les données ci-dessous représentent les{' '}
              <strong>économies d'impact environnemental</strong> réalisées en
              choisissant la location d'équipements existants par rapport à
              l'achat de produits neufs. Cette approche permet de réduire
              significativement l'empreinte carbone et l'utilisation de
              ressources.
            </p>
          </div>
        </div>
      </div>

      {/* Vue d'ensemble des économies */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`bg-gradient-to-br from-green-50 to-emerald-50 border-2 ${savingsLevel.borderColor} rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden`}>
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center shadow-sm">
                  <TreePine className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-900">
                    Économies environnementales totales
                  </h3>
                  <p className="text-sm font-medium text-green-700">
                    Bénéfices de la location vs achat neuf
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-3">
                  <Badge className={`${savingsLevel.bgColor} ${savingsLevel.color} border-0 px-4 py-2`}>
                    <savingsLevel.icon className="w-4 h-4 mr-2" />
                    Impact {savingsLevel.label}
                  </Badge>
                </div>
                <div className="text-4xl font-bold text-green-900 mt-2">
                  {totalSavings.toFixed(1)}
                </div>
                <div className="text-sm font-medium text-green-700">
                  points d'économie totaux
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div> */}

      {/* Métriques détaillées des économies */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {metrics.map(([key, value], index) => {
          const info = getMetricInfo(key);
          const IconComponent = info.icon;
          const metricSavingsLevel = getSavingsLevel(value);

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className='bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden'>
                <div className='p-6'>
                  <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-300 ${
                          info.color === 'text-red-500'
                            ? 'bg-gradient-to-br from-red-100 to-pink-100'
                            : info.color === 'text-amber-500'
                            ? 'bg-gradient-to-br from-amber-100 to-yellow-100'
                            : info.color === 'text-blue-500'
                            ? 'bg-gradient-to-br from-blue-100 to-cyan-100'
                            : 'bg-gradient-to-br from-green-100 to-emerald-100'
                        }`}
                      >
                        <IconComponent className={`w-6 h-6 ${info.color}`} />
                      </div>
                      <div>
                        <h3 className='text-lg font-bold text-gray-900'>
                          {info.name}
                        </h3>
                        <p className='text-sm text-gray-600'>
                          {info.description}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`${metricSavingsLevel.bgColor} ${metricSavingsLevel.color} border-0 px-3 py-1`}
                    >
                      <metricSavingsLevel.icon className='w-3 h-3 mr-1' />
                      {metricSavingsLevel.label}
                    </Badge>
                  </div>

                  <div className='text-center mb-6'>
                    <div
                      className={`text-4xl font-bold mb-2 ${
                        info.color === 'text-red-500'
                          ? 'bg-gradient-to-br from-red-500 to-pink-500'
                          : info.color === 'text-amber-500'
                          ? 'bg-gradient-to-br from-amber-500 to-yellow-500'
                          : info.color === 'text-blue-500'
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                          : 'bg-gradient-to-br from-green-500 to-emerald-500'
                      } bg-clip-text text-transparent`}
                    >
                      {formatEnvironmentalImpact(value, info.formatUnit)}
                    </div>
                    <div className='text-sm text-gray-600 font-medium'>
                      {info.unit} économisés
                    </div>
                  </div>

                  {/* <div className='space-y-3'>
                    <div className='flex items-center justify-between text-sm p-3 bg-green-50 rounded-xl'>
                      <span className='text-green-700 font-medium'>
                        Niveau d'économie
                      </span>
                      <span className='font-bold text-green-900'>
                        {Math.round((value / 1000) * 100)}%
                      </span>
                    </div>
                    <div className='bg-green-100 rounded-xl p-2'>
                      <Progress
                        value={Math.min((value / 1000) * 100, 100)}
                        className='h-3'
                      />
                    </div>
                  </div> */}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Comparaison location vs neuf */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className='bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 rounded-2xl shadow-sm'>
          <CardHeader>
            <CardTitle className='flex items-center space-x-3'>
              <div className='p-2 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl'>
                <Recycle className='w-5 h-5 text-emerald-600' />
              </div>
              <span className='text-emerald-900'>
                Avantages environnementaux de la location
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-3'>
                <h4 className='font-semibold text-emerald-800 flex items-center'>
                  <CheckCircle className='w-4 h-4 mr-2' />
                  Bénéfices mesurables
                </h4>
                <ul className='text-sm text-emerald-700 space-y-2'>
                  <li className='flex items-start'>
                    <div className='w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2 mr-3 flex-shrink-0'></div>
                    <span>
                      Réduction CO₂ :{' '}
                      <strong>
                        {formatEnvironmentalImpact(
                          savings.rechauffementClimatique,
                          'kg'
                        )}{' '}
                        kg évités
                      </strong>
                    </span>
                  </li>
                  <li className='flex items-start'>
                    <div className='w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2 mr-3 flex-shrink-0'></div>
                    <span>
                      Économie d'énergie :{' '}
                      <strong>
                        {formatEnvironmentalImpact(
                          savings.epuisementRessources,
                          'MJ'
                        )}{' '}
                        MJ préservés
                      </strong>
                    </span>
                  </li>
                  <li className='flex items-start'>
                    <div className='w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2 mr-3 flex-shrink-0'></div>
                    <span>
                      Réduction acidification :{' '}
                      <strong>
                        {formatEnvironmentalImpact(
                          savings.acidification,
                          'MOL'
                        )}{' '}
                        MOL H⁺
                      </strong>
                    </span>
                  </li>
                </ul>
              </div>

              <div className='space-y-3'>
                <h4 className='font-semibold text-emerald-800 flex items-center'>
                  <TreePine className='w-4 h-4 mr-2' />
                  Impact global
                </h4>
                <div className='bg-white/60 rounded-xl p-4 border border-emerald-200'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-emerald-900 mb-1'>
                      {Math.round((totalSavings / 1000) * 100)}%
                    </div>
                    <div className='text-xs text-emerald-700'>
                      de réduction d'impact vs neuf
                    </div>
                  </div>
                </div>
                <p className='text-xs text-emerald-700 leading-relaxed'>
                  En optant pour la location, ce projet évite la fabrication de
                  nouveaux équipements, réduisant ainsi considérablement son
                  empreinte environnementale.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div> */}

      {/* Note importante */}
      <div className='bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4'>
        <div className='flex items-start space-x-3'>
          <AlertTriangle className='w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0' />
          <div>
            <h4 className='font-semibold text-amber-800 mb-1'>
              Note importante
            </h4>
            <p className='text-xs text-amber-700 leading-relaxed'>
              <strong>Pour l'achat de produits neufs</strong>, nous ne disposons
              pas actuellement de données d'impact environnemental spécifiques.
              Les économies affichées correspondent uniquement aux bénéfices de
              la location par rapport à une estimation d'impact pour des
              produits neufs équivalents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
