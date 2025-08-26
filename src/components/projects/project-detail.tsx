"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project } from "@/lib/types/project";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Plus,
  Package,
  Leaf,
  Euro,
  TrendingUp,
  BarChart3,
  Calendar,
  User,
  Target,
  Zap,
  Droplets,
  Flame,
} from "lucide-react";
import Link from "next/link";
import { AddKitModal } from "./add-kit-modal";
import { EnvironmentalMetrics } from "./environmental-metrics";
import { PricingBreakdown } from "./pricing-breakdown";
import { KitsList } from "./kits-list";

interface ProjectDetailProps {
  project: Project;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const [isAddKitModalOpen, setIsAddKitModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIF":
        return "bg-green-100 text-green-800";
      case "TERMINE":
        return "bg-blue-100 text-blue-800";
      case "EN_PAUSE":
        return "bg-yellow-100 text-yellow-800";
      case "ARCHIVE":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIF":
        return "🟢";
      case "TERMINE":
        return "🔵";
      case "EN_PAUSE":
        return "🟡";
      case "ARCHIVE":
        return "⚫";
      default:
        return "⚪";
    }
  };

  // Gestionnaire pour ajouter des kits
  const handleAddKits = (kits: { kitId: string; quantite: number }[]) => {
    // TODO: Implémenter la logique d'ajout de kits
    console.log("Ajout de kits:", kits);
    setIsAddKitModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div className="flex items-center space-x-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/projects">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Link>
          </Button>

          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {project.nom}
            </h1>
            {project.description && (
              <p className="text-gray-600 mt-2 max-w-2xl">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge
            className={`${getStatusColor(
              project.status
            )} text-sm font-medium px-3 py-1`}
          >
            {getStatusIcon(project.status)} {project.status}
          </Badge>

          <Button asChild variant="outline" size="sm">
            <Link href={`/projects/${project.id}/modifier`}>
              <Edit3 className="w-4 h-4 mr-2" />
              Modifier
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="border-red-200 hover:bg-red-50 text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Métriques principales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Euro className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Prix Total</p>
                <p className="text-2xl font-bold text-blue-900">
                  {project.totalPrix?.toFixed(0) || "0"} €
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Impact CO₂</p>
                <p className="text-2xl font-bold text-green-900">
                  {project.totalImpact?.rechauffementClimatique?.toFixed(1) ||
                    "0"}{" "}
                  kg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Kits</p>
                <p className="text-2xl font-bold text-purple-900">
                  {project.projectKits?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700">Créé le</p>
                <p className="text-lg font-bold text-orange-900">
                  {new Date(project.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-teal-700">
                  Surface totale
                </p>
                <p className="text-2xl font-bold text-teal-900">
                  {project.totalSurface?.toFixed(1) || "0"} m²
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs pour les détails */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="kits" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1">
            <TabsTrigger
              value="kits"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Package className="w-4 h-4 mr-2" />
              Kits
            </TabsTrigger>
            <TabsTrigger
              value="environmental"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Leaf className="w-4 h-4 mr-2" />
              Impact Environnemental
            </TabsTrigger>
            <TabsTrigger
              value="pricing"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Euro className="w-4 h-4 mr-2" />
              Prix & Coûts
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kits" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Kits du projet
              </h2>
              <Button
                onClick={() => setIsAddKitModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un kit
              </Button>
            </div>

            {project.projectKits && project.projectKits.length > 0 ? (
              <KitsList projectKits={project.projectKits} />
            ) : (
              <p className="text-gray-500 italic">Aucun kit pour le moment</p>
            )}
          </TabsContent>

          <TabsContent value="environmental" className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Impact environnemental
            </h2>
            {project.totalImpact ? (
              <EnvironmentalMetrics impact={project.totalImpact} />
            ) : (
              <p className="text-gray-500 italic">
                Aucune donnée d'impact disponible
              </p>
            )}
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Détail des prix
            </h2>
            <PricingBreakdown project={project} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Analytics du projet
            </h2>
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Analytics avancées à venir...</p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Modal d'ajout de kit */}
      <AnimatePresence>
        {isAddKitModalOpen && (
          <AddKitModal
            isOpen={isAddKitModalOpen}
            onClose={() => setIsAddKitModalOpen(false)}
            onAddKits={handleAddKits}
            projectId={project.id}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
