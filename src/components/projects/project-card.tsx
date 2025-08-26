"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Project } from "@/lib/types/project";
import {
  Calendar,
  Package,
  TrendingUp,
  Leaf,
  Euro,
  Eye,
  Edit3,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <Card className="h-full bg-white/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardHeader className="relative pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                {project.nom}
              </CardTitle>
              {project.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
            <Badge
              className={`${getStatusColor(
                project.status
              )} text-xs font-medium px-2 py-1`}
            >
              {getStatusIcon(project.status)} {project.status}
            </Badge>
          </div>

          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(project.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Package className="w-4 h-4" />
              <span>{project.projectKits?.length || 0} kits</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Métriques rapides */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100"
            >
              <div className="flex items-center space-x-2">
                <Leaf className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  Impact
                </span>
              </div>
              <div className="text-lg font-bold text-green-800 mt-1">
                {project.totalImpact?.rechauffementClimatique?.toFixed(1) ||
                  "0"}{" "}
                kg CO₂
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100"
            >
              <div className="flex items-center space-x-2">
                <Euro className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">
                  Prix Total
                </span>
              </div>
              <div className="text-lg font-bold text-blue-800 mt-1">
                {project.totalPrix?.toFixed(0) || "0"} €
              </div>
            </motion.div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <Button
              asChild
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
            >
              <Link href={`/projects/${project.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                Voir
              </Link>
            </Button>

            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-gray-200 hover:bg-gray-50"
            >
              <Link href={`/projects/${project.id}/modifier`}>
                <Edit3 className="w-4 h-4" />
              </Link>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>

        {/* Effet de brillance au survol */}
        {isHovered && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
          />
        )}
      </Card>
    </motion.div>
  );
}
