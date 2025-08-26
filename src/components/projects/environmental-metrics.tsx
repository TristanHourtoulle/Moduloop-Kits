"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Leaf,
  Flame,
  Droplets,
  Zap,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

interface EnvironmentalImpact {
  rechauffementClimatique: number;
  epuisementRessources: number;
  acidification: number;
  eutrophisation: number;
}

interface EnvironmentalMetricsProps {
  impact: EnvironmentalImpact;
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
        unit: "kg CO2 eq",
        description: "Contribution au changement climatique",
        icon: Flame,
        color: "text-red-500",
      };
    case "epuisementRessources":
      return {
        name: "Épuisement des ressources",
        unit: "kg Sb eq",
        description: "Épuisement des ressources non renouvelables",
        icon: Zap,
        color: "text-amber-500",
      };
    case "acidification":
      return {
        name: "Acidification",
        unit: "kg SO2 eq",
        description: "Acidification des sols et des eaux",
        icon: Droplets,
        color: "text-blue-500",
      };
    case "eutrophisation":
      return {
        name: "Eutrophisation",
        unit: "kg PO4 eq",
        description: "Eutrophisation des eaux",
        icon: Leaf,
        color: "text-green-500",
      };
    default:
      return {
        name: "Métrique",
        unit: "unit",
        description: "Description",
        icon: Info,
        color: "text-gray-500",
      };
  }
};

export function EnvironmentalMetrics({ impact }: EnvironmentalMetricsProps) {
  const metrics = Object.entries(impact);
  const totalImpact = Object.values(impact).reduce(
    (sum, value) => sum + value,
    0
  );

  return (
    <div className="space-y-6">
      {/* Vue d&apos;ensemble */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    Impact environnemental total
                  </h3>
                  <p className="text-sm text-green-600">
                    Score global du projet
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-900">
                  {totalImpact.toFixed(1)}
                </div>
                <div className="text-sm text-green-600">
                  points d&apos;impact
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
              key={key}
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
                      {value.toFixed(2)}
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">
                  Recommandations
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    • Privilégiez les produits avec des certifications
                    environnementales
                  </li>
                  <li>
                    • Optimisez les quantités pour réduire l&apos;impact global
                  </li>
                  <li>
                    • Considérez des alternatives plus durables quand c&apos;est
                    possible
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
