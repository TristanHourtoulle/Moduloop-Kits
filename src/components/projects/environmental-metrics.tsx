"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Leaf,
  Flame,
  Droplets,
  Zap,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  ShoppingCart,
  Home,
} from "lucide-react";
import { Project } from "@/lib/types/project";
import { type PurchaseRentalMode } from "@/lib/schemas/product";
import {
  getProductEnvironmentalImpact,
  formatEnvironmentalImpact,
} from "@/lib/utils/product-helpers";

interface EnvironmentalImpact {
  rechauffementClimatique: number;
  epuisementRessources: number;
  acidification: number;
  eutrophisation: number;
}

interface EnvironmentalMetricsProps {
  project: Project;
}

const getImpactLevel = (value: number, metric: string) => {
  let thresholds: { low: number; medium: number; high: number };

  switch (metric) {
    case "rechauffementClimatique":
      thresholds = { low: 100, medium: 500, high: 1000 };
      break;
    case "epuisementRessources":
      thresholds = { low: 50, medium: 200, high: 500 };
      break;
    case "acidification":
      thresholds = { low: 20, medium: 100, high: 300 };
      break;
    case "eutrophisation":
      thresholds = { low: 10, medium: 50, high: 150 };
      break;
    default:
      thresholds = { low: 100, medium: 500, high: 1000 };
  }

  if (value <= thresholds.low)
    return {
      level: "low",
      color: "text-green-600",
      bgColor: "bg-green-100",
      icon: CheckCircle,
    };
  if (value <= thresholds.medium)
    return {
      level: "medium",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      icon: AlertTriangle,
    };
  return {
    level: "high",
    color: "text-red-600",
    bgColor: "bg-red-100",
    icon: TrendingDown,
  };
};

const getMetricInfo = (metric: string) => {
  switch (metric) {
    case "rechauffementClimatique":
      return {
        name: "Réchauffement climatique",
        unit: "kg CO₂ eq",
        description: "Contribution au changement climatique",
        icon: Flame,
        color: "text-red-500",
        formatUnit: "kg" as const,
      };
    case "epuisementRessources":
      return {
        name: "Épuisement des ressources",
        unit: "MJ",
        description: "Épuisement des ressources fossiles",
        icon: Zap,
        color: "text-amber-500",
        formatUnit: "MJ" as const,
      };
    case "acidification":
      return {
        name: "Acidification",
        unit: "MOL H⁺",
        description: "Acidification des sols et des eaux",
        icon: Droplets,
        color: "text-blue-500",
        formatUnit: "MOL" as const,
      };
    case "eutrophisation":
      return {
        name: "Eutrophisation",
        unit: "kg P eq",
        description: "Eutrophisation marine",
        icon: Leaf,
        color: "text-green-500",
        formatUnit: "kg" as const,
      };
    default:
      return {
        name: "Métrique",
        unit: "unit",
        description: "Description",
        icon: Info,
        color: "text-gray-500",
        formatUnit: "kg" as const,
      };
  }
};

const calculateProjectEnvironmentalImpact = (project: Project, mode: PurchaseRentalMode): EnvironmentalImpact => {
  if (!project.projectKits) {
    return {
      rechauffementClimatique: 0,
      epuisementRessources: 0,
      acidification: 0,
      eutrophisation: 0,
    };
  }

  let totalRechauffementClimatique = 0;
  let totalEpuisementRessources = 0;
  let totalAcidification = 0;
  let totalEutrophisation = 0;

  project.projectKits.forEach((projectKit) => {
    const kit = projectKit.kit;
    if (!kit || !kit.kitProducts) return;

    kit.kitProducts.forEach((kitProduct) => {
      const product = kitProduct.product;
      if (product) {
        const impact = getProductEnvironmentalImpact(product, mode);
        const totalQuantity = kitProduct.quantite * projectKit.quantite;

        totalRechauffementClimatique += (impact.rechauffementClimatique || 0) * totalQuantity;
        totalEpuisementRessources += (impact.epuisementRessources || 0) * totalQuantity;
        totalAcidification += (impact.acidification || 0) * totalQuantity;
        totalEutrophisation += (impact.eutrophisation || 0) * totalQuantity;
      }
    });
  });

  return {
    rechauffementClimatique: totalRechauffementClimatique,
    epuisementRessources: totalEpuisementRessources,
    acidification: totalAcidification,
    eutrophisation: totalEutrophisation,
  };
};

export function EnvironmentalMetrics({ project }: EnvironmentalMetricsProps) {
  const [selectedMode, setSelectedMode] = useState<PurchaseRentalMode>('achat');
  
  const impact = calculateProjectEnvironmentalImpact(project, selectedMode);
  const metrics = Object.entries(impact);
  const totalImpact = Object.values(impact).reduce(
    (sum, value) => sum + value,
    0
  );

  return (
    <div className="space-y-6">
      {/* Sélecteur de mode achat/location */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Leaf className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Mode d'impact environnemental</span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={selectedMode === 'achat' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMode('achat')}
            className={`flex items-center gap-2 ${
              selectedMode === 'achat' ? 'bg-[#30C1BD] hover:bg-[#30C1BD]/90' : ''
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Achat (Neuf)
          </Button>
          <Button
            variant={selectedMode === 'location' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMode('location')}
            className={`flex items-center gap-2 ${
              selectedMode === 'location' ? 'bg-[#30C1BD] hover:bg-[#30C1BD]/90' : ''
            }`}
          >
            <Home className="w-4 h-4" />
            Location (Existant)
          </Button>
        </div>
      </div>
      {/* Vue d&apos;ensemble */}
      <motion.div
        key={`overview-${selectedMode}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={`bg-gradient-to-br border-2 ${
          selectedMode === 'achat' 
            ? 'from-orange-50 to-red-50 border-orange-200' 
            : 'from-green-50 to-emerald-50 border-green-200'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedMode === 'achat' ? 'bg-orange-100' : 'bg-green-100'
                }`}>
                  {selectedMode === 'achat' ? (
                    <ShoppingCart className="w-6 h-6 text-orange-600" />
                  ) : (
                    <Home className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    selectedMode === 'achat' ? 'text-orange-800' : 'text-green-800'
                  }`}>
                    Impact environnemental - {selectedMode === 'achat' ? 'Achat' : 'Location'}
                  </h3>
                  <p className={`text-sm ${
                    selectedMode === 'achat' ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {selectedMode === 'achat' 
                      ? 'Impact complet de la fabrication neuve' 
                      : 'Impact réduit de la réutilisation'
                    }
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${
                  selectedMode === 'achat' ? 'text-orange-900' : 'text-green-900'
                }`}>
                  {totalImpact.toFixed(1)}
                </div>
                <div className={`text-sm ${
                  selectedMode === 'achat' ? 'text-orange-600' : 'text-green-600'
                }`}>
                  points d&apos;impact total
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Métriques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map(([key, value], index) => {
          const info = getMetricInfo(key);
          const impactLevel = getImpactLevel(value, key);
          const IconComponent = info.icon;
          const LevelIcon = impactLevel.icon;

          return (
            <motion.div
              key={`${key}-${selectedMode}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <IconComponent className={`w-5 h-5 ${info.color}`} />
                      <CardTitle className="text-base">{info.name}</CardTitle>
                    </div>
                    <Badge
                      className={`${impactLevel.bgColor} ${impactLevel.color} border-0`}
                    >
                      <LevelIcon className="w-3 h-3 mr-1" />
                      {impactLevel.level === "low"
                        ? "Faible"
                        : impactLevel.level === "medium"
                        ? "Moyen"
                        : "Élevé"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {formatEnvironmentalImpact(value, info.formatUnit)}
                    </div>
                    <div className="text-sm text-gray-500">{info.unit}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Niveau d&apos;impact
                      </span>
                      <span className="font-medium">
                        {Math.round((value / 1000) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min((value / 1000) * 100, 100)}
                      className="h-2"
                    />
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    {info.description}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recommandations */}
      <motion.div
        key={`recommendations-${selectedMode}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className={`bg-gradient-to-br border-2 ${
          selectedMode === 'achat'
            ? 'from-amber-50 to-orange-50 border-amber-200'
            : 'from-blue-50 to-green-50 border-blue-200'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Info className={`w-5 h-5 mt-0.5 ${
                selectedMode === 'achat' ? 'text-amber-600' : 'text-blue-600'
              }`} />
              <div>
                <h3 className={`font-semibold mb-2 ${
                  selectedMode === 'achat' ? 'text-amber-800' : 'text-blue-800'
                }`}>
                  Recommandations pour {selectedMode === 'achat' ? 'l\'achat' : 'la location'}
                </h3>
                <ul className={`text-sm space-y-1 ${
                  selectedMode === 'achat' ? 'text-amber-700' : 'text-blue-700'
                }`}>
                  {selectedMode === 'achat' ? (
                    <>
                      <li>
                        • Privilégiez les produits avec des certifications environnementales (Energy Star, EPEAT, etc.)
                      </li>
                      <li>
                        • Négociez des programmes de reprise en fin de vie avec les fournisseurs
                      </li>
                      <li>
                        • Optez pour des produits conçus pour la durabilité et la réparabilité
                      </li>
                      <li>
                        • Planifiez le recyclage et la valorisation des équipements en fin d\'usage
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        • La location réduit significativement l\'impact environnemental (division par 3 à 10)
                      </li>
                      <li>
                        • Maximisez la durée de location pour optimiser l\'amortissement environnemental
                      </li>
                      <li>
                        • Vérifiez que les équipements loués bénéficient d\'un entretien régulier
                      </li>
                      <li>
                        • Privilégiez les loueurs engagés dans des démarches de reconditionnement
                      </li>
                    </>
                  )}
                </ul>

                {/* Information sur la différence d'impact */}
                <div className={`mt-4 p-3 rounded-lg ${
                  selectedMode === 'achat'
                    ? 'bg-amber-100 border border-amber-300'
                    : 'bg-green-100 border border-green-300'
                }`}>
                  <p className={`text-xs ${
                    selectedMode === 'achat' ? 'text-amber-800' : 'text-green-800'
                  }`}>
                    <strong>
                      {selectedMode === 'achat' 
                        ? 'Impact environnemental complet :' 
                        : 'Bénéfice environnemental de la location :'
                      }
                    </strong>{' '}
                    {selectedMode === 'achat'
                      ? 'Ces valeurs incluent l\'extraction des matières premières, la fabrication, le transport et la distribution des produits neufs.'
                      : 'En réutilisant des équipements existants, la location permet de diviser l\'impact environnemental par 3 à 10 comparé à l\'achat neuf.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
