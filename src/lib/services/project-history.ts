import { prisma } from '@/lib/db';
import { ProjectChangeType, Project, Kit } from '@prisma/client';

export interface ProjectHistoryContext {
  userId: string;
  projectId: string;
  changeType: ProjectChangeType;
  description: string;
  changedFields?: string[];
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Records a project history event
 */
export async function recordProjectHistory(context: ProjectHistoryContext) {
  try {
    await prisma.projectHistory.create({
      data: {
        projectId: context.projectId,
        changeType: context.changeType,
        description: context.description,
        changedFields: context.changedFields ? JSON.stringify(context.changedFields) : undefined,
        oldValues: context.oldValues ? JSON.stringify(context.oldValues) : undefined,
        newValues: context.newValues ? JSON.stringify(context.newValues) : undefined,
        metadata: context.metadata ? JSON.stringify(context.metadata) : undefined,
        changedById: context.userId,
      },
    });
  } catch (error) {
    console.error('Failed to record project history:', error);
    // Don't throw - history recording should not break main operations
  }
}

/**
 * Helper to create history for project creation
 */
export function createProjectCreatedHistory(userId: string, project: Project) {
  return recordProjectHistory({
    userId,
    projectId: project.id,
    changeType: 'CREATED',
    description: `Le projet "${project.nom}" a été créé`,
    metadata: {
      projectName: project.nom,
      projectStatus: project.status,
    },
  });
}

/**
 * Helper to create history for project updates
 */
export function createProjectUpdatedHistory(
  userId: string,
  projectId: string,
  oldProject: Partial<Project>,
  newProject: Partial<Project>
) {
  const changedFields: string[] = [];
  const oldValues: Record<string, unknown> = {};
  const newValues: Record<string, unknown> = {};

  // Check each field for changes
  if (oldProject.nom !== newProject.nom) {
    changedFields.push('nom');
    oldValues.nom = oldProject.nom;
    newValues.nom = newProject.nom;
  }

  if (oldProject.description !== newProject.description) {
    changedFields.push('description');
    oldValues.description = oldProject.description;
    newValues.description = newProject.description;
  }

  if (oldProject.status !== newProject.status) {
    changedFields.push('status');
    oldValues.status = oldProject.status;
    newValues.status = newProject.status;
  }

  // Generate appropriate description
  let description = 'Le projet a été modifié';
  if (changedFields.length === 1) {
    switch (changedFields[0]) {
      case 'nom':
        description = `Le nom du projet a été changé de "${oldValues.nom}" à "${newValues.nom}"`;
        break;
      case 'status':
        description = `Le statut du projet a été changé de "${oldValues.status}" à "${newValues.status}"`;
        break;
      case 'description':
        description = 'La description du projet a été modifiée';
        break;
    }
  } else if (changedFields.length > 1) {
    description = `Le projet a été modifié (${changedFields.join(', ')})`;
  }

  if (changedFields.length > 0) {
    return recordProjectHistory({
      userId,
      projectId,
      changeType: oldProject.status !== newProject.status ? 'STATUS_CHANGED' : 'UPDATED',
      description,
      changedFields,
      oldValues,
      newValues,
    });
  }

  return Promise.resolve();
}

/**
 * Helper to create history for project deletion
 */
export function createProjectDeletedHistory(userId: string, project: Project) {
  return recordProjectHistory({
    userId,
    projectId: project.id,
    changeType: 'DELETED',
    description: `Le projet "${project.nom}" a été supprimé`,
    metadata: {
      projectName: project.nom,
      projectStatus: project.status,
    },
  });
}

/**
 * Helper to create history for kit addition
 */
export function createKitAddedHistory(
  userId: string,
  projectId: string,
  kit: Kit,
  quantity: number
) {
  return recordProjectHistory({
    userId,
    projectId,
    changeType: 'KIT_ADDED',
    description: `Le kit "${kit.nom}" a été ajouté au projet (${quantity} unité${quantity > 1 ? 's' : ''})`,
    metadata: {
      kitId: kit.id,
      kitName: kit.nom,
      kitStyle: kit.style,
      quantity,
    },
  });
}

/**
 * Helper to create history for kit removal
 */
export function createKitRemovedHistory(
  userId: string,
  projectId: string,
  kit: Kit,
  quantity: number
) {
  return recordProjectHistory({
    userId,
    projectId,
    changeType: 'KIT_REMOVED',
    description: `Le kit "${kit.nom}" a été retiré du projet (${quantity} unité${quantity > 1 ? 's' : ''})`,
    metadata: {
      kitId: kit.id,
      kitName: kit.nom,
      kitStyle: kit.style,
      quantity,
    },
  });
}

/**
 * Helper to create history for kit quantity update
 */
export function createKitQuantityUpdatedHistory(
  userId: string,
  projectId: string,
  kit: Kit,
  oldQuantity: number,
  newQuantity: number
) {
  return recordProjectHistory({
    userId,
    projectId,
    changeType: 'KIT_QUANTITY_UPDATED',
    description: `La quantité du kit "${kit.nom}" a été modifiée de ${oldQuantity} à ${newQuantity} unité${newQuantity > 1 ? 's' : ''}`,
    metadata: {
      kitId: kit.id,
      kitName: kit.nom,
      kitStyle: kit.style,
      oldQuantity,
      newQuantity,
    },
  });
}

/**
 * Fetches project history with user information
 */
export async function getProjectHistory(projectId: string) {
  return await prisma.projectHistory.findMany({
    where: {
      projectId,
    },
    include: {
      changedBy: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}