'use client';

import { Suspense, useEffect, useState } from 'react';
import { ProjectDetail } from '@/components/projects/project-detail';
import { ProjectDetailSkeleton } from '@/components/projects/project-detail-skeleton';
import { notFound, useParams } from 'next/navigation';
import { Project } from '@/lib/types/project';

function ProjectContent() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        setError(true);
        return;
      }

      const data = await response.json();
      setProject(data);
      setError(false);
    } catch (error) {
      console.error('Erreur lors du chargement du projet:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour optimiste du projet sans rechargement complet
  const updateProject = (updatedProject: Project) => {
    setProject(updatedProject);
  };

  useEffect(() => {
    if (!projectId) return;
    fetchProject();
  }, [projectId]);

  if (loading) {
    return <ProjectDetailSkeleton />;
  }

  if (error || !project) {
    notFound();
    return null;
  }

  return (
    <ProjectDetail
      project={project}
      onProjectUpdate={updateProject}
      refreshProject={fetchProject}
    />
  );
}

export default function ProjectPage() {
  return (
    <Suspense fallback={<ProjectDetailSkeleton />}>
      <ProjectContent />
    </Suspense>
  );
}
