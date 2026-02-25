import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Project, Kit } from '@prisma/client'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/db', () => ({
  prisma: {
    projectHistory: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/db'
import {
  recordProjectHistory,
  createProjectCreatedHistory,
  createProjectUpdatedHistory,
  createProjectDeletedHistory,
  createKitAddedHistory,
  createKitRemovedHistory,
  createKitQuantityUpdatedHistory,
  getProjectHistory,
} from './project-history'

const mockCreate = vi.mocked(prisma.projectHistory.create)
const mockFindMany = vi.mocked(prisma.projectHistory.findMany)

function makePrismaProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'project-1',
    nom: 'Test Project',
    status: 'ACTIF',
    description: null,
    surfaceManual: null,
    surfaceOverride: false,
    createdById: 'user-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }
}

function makePrismaKit(overrides: Partial<Kit> = {}): Kit {
  return {
    id: 'kit-1',
    nom: 'Test Kit',
    style: 'modern',
    description: null,
    surfaceM2: null,
    createdById: 'user-1',
    updatedById: 'user-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockCreate.mockResolvedValue(undefined as never)
})

describe('recordProjectHistory', () => {
  it('calls prisma.projectHistory.create with JSON-stringified fields', async () => {
    await recordProjectHistory({
      userId: 'user-1',
      projectId: 'project-1',
      changeType: 'CREATED',
      description: 'Project created',
      changedFields: ['nom'],
      oldValues: { nom: 'Old' },
      newValues: { nom: 'New' },
      metadata: { key: 'value' },
    })

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        projectId: 'project-1',
        changeType: 'CREATED',
        description: 'Project created',
        changedFields: JSON.stringify(['nom']),
        oldValues: JSON.stringify({ nom: 'Old' }),
        newValues: JSON.stringify({ nom: 'New' }),
        metadata: JSON.stringify({ key: 'value' }),
        changedById: 'user-1',
      },
    })
  })

  it('omits optional fields when undefined', async () => {
    await recordProjectHistory({
      userId: 'user-1',
      projectId: 'project-1',
      changeType: 'DELETED',
      description: 'Deleted',
    })

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        projectId: 'project-1',
        changeType: 'DELETED',
        description: 'Deleted',
        changedFields: undefined,
        oldValues: undefined,
        newValues: undefined,
        metadata: undefined,
        changedById: 'user-1',
      },
    })
  })

  it('swallows errors without throwing', async () => {
    mockCreate.mockRejectedValueOnce(new Error('DB connection failed'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(
      recordProjectHistory({
        userId: 'user-1',
        projectId: 'project-1',
        changeType: 'CREATED',
        description: 'Test',
      }),
    ).resolves.toBeUndefined()

    expect(consoleSpy).toHaveBeenCalledWith('Failed to record project history:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})

describe('createProjectCreatedHistory', () => {
  it('records CREATED event with project metadata', async () => {
    const project = makePrismaProject({ nom: 'My Project', status: 'ACTIF' })
    await createProjectCreatedHistory('user-1', project)

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        projectId: 'project-1',
        changeType: 'CREATED',
        description: 'Le projet "My Project" a été créé',
        metadata: JSON.stringify({
          projectName: 'My Project',
          projectStatus: 'ACTIF',
        }),
        changedById: 'user-1',
      }),
    })
  })
})

describe('createProjectUpdatedHistory', () => {
  it('does not record when no fields changed', async () => {
    const project: Partial<Project> = {
      nom: 'Same',
      status: 'ACTIF',
      description: 'Desc',
    }
    await createProjectUpdatedHistory('user-1', 'project-1', project, project)

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('records name change with UPDATED changeType', async () => {
    await createProjectUpdatedHistory(
      'user-1',
      'project-1',
      { nom: 'Old Name', status: 'ACTIF' } satisfies Partial<Project>,
      { nom: 'New Name', status: 'ACTIF' } satisfies Partial<Project>,
    )

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        changeType: 'UPDATED',
        description: 'Le nom du projet a été changé de "Old Name" à "New Name"',
        changedFields: JSON.stringify(['nom']),
        oldValues: JSON.stringify({ nom: 'Old Name' }),
        newValues: JSON.stringify({ nom: 'New Name' }),
      }),
    })
  })

  it('records status change with STATUS_CHANGED changeType', async () => {
    await createProjectUpdatedHistory(
      'user-1',
      'project-1',
      { nom: 'Project', status: 'ACTIF' } satisfies Partial<Project>,
      { nom: 'Project', status: 'TERMINE' } satisfies Partial<Project>,
    )

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        changeType: 'STATUS_CHANGED',
        description: 'Le statut du projet a été changé de "ACTIF" à "TERMINE"',
      }),
    })
  })

  it('records description change with specific message', async () => {
    await createProjectUpdatedHistory(
      'user-1',
      'project-1',
      { description: 'Old desc' },
      { description: 'New desc' },
    )

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        changeType: 'UPDATED',
        description: 'La description du projet a été modifiée',
      }),
    })
  })

  it('records multiple field changes with generic description', async () => {
    await createProjectUpdatedHistory(
      'user-1',
      'project-1',
      { nom: 'Old', description: 'Old desc' },
      { nom: 'New', description: 'New desc' },
    )

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        changeType: 'UPDATED',
        description: 'Le projet a été modifié (nom, description)',
      }),
    })
  })

  it('uses STATUS_CHANGED when status and other fields change together', async () => {
    await createProjectUpdatedHistory(
      'user-1',
      'project-1',
      { nom: 'Old', status: 'ACTIF' } satisfies Partial<Project>,
      { nom: 'New', status: 'TERMINE' } satisfies Partial<Project>,
    )

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        changeType: 'STATUS_CHANGED',
      }),
    })
  })
})

describe('createProjectDeletedHistory', () => {
  it('records DELETED event with project metadata', async () => {
    const project = makePrismaProject({ nom: 'Deleted Project' })
    await createProjectDeletedHistory('user-1', project)

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        changeType: 'DELETED',
        description: 'Le projet "Deleted Project" a été supprimé',
        metadata: JSON.stringify({
          projectName: 'Deleted Project',
          projectStatus: 'ACTIF',
        }),
      }),
    })
  })
})

describe('createKitAddedHistory', () => {
  it('records KIT_ADDED with singular unit label', async () => {
    const kit = makePrismaKit({ nom: 'Kit A' })
    await createKitAddedHistory('user-1', 'project-1', kit, 1)

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        changeType: 'KIT_ADDED',
        description: 'Le kit "Kit A" a été ajouté au projet (1 unité)',
        metadata: JSON.stringify({
          kitId: 'kit-1',
          kitName: 'Kit A',
          kitStyle: 'modern',
          quantity: 1,
        }),
      }),
    })
  })

  it('records KIT_ADDED with plural unit label', async () => {
    const kit = makePrismaKit({ nom: 'Kit B' })
    await createKitAddedHistory('user-1', 'project-1', kit, 3)

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        description: 'Le kit "Kit B" a été ajouté au projet (3 unités)',
      }),
    })
  })
})

describe('createKitRemovedHistory', () => {
  it('records KIT_REMOVED event', async () => {
    const kit = makePrismaKit({ nom: 'Kit C' })
    await createKitRemovedHistory('user-1', 'project-1', kit, 2)

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        changeType: 'KIT_REMOVED',
        description: 'Le kit "Kit C" a été retiré du projet (2 unités)',
      }),
    })
  })

  it('uses singular label for quantity 1', async () => {
    const kit = makePrismaKit()
    await createKitRemovedHistory('user-1', 'project-1', kit, 1)

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        description: expect.stringContaining('1 unité)'),
      }),
    })
  })
})

describe('createKitQuantityUpdatedHistory', () => {
  it('records quantity change with correct description', async () => {
    const kit = makePrismaKit({ nom: 'Kit D' })
    await createKitQuantityUpdatedHistory('user-1', 'project-1', kit, 2, 5)

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        changeType: 'KIT_QUANTITY_UPDATED',
        description: 'La quantité du kit "Kit D" a été modifiée de 2 à 5 unités',
        metadata: JSON.stringify({
          kitId: 'kit-1',
          kitName: 'Kit D',
          kitStyle: 'modern',
          oldQuantity: 2,
          newQuantity: 5,
        }),
      }),
    })
  })

  it('uses singular label when new quantity is 1', async () => {
    const kit = makePrismaKit({ nom: 'Kit E' })
    await createKitQuantityUpdatedHistory('user-1', 'project-1', kit, 3, 1)

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        description: 'La quantité du kit "Kit E" a été modifiée de 3 à 1 unité',
      }),
    })
  })
})

describe('getProjectHistory', () => {
  it('queries with correct parameters and returns results', async () => {
    const mockHistory = [{ id: 'h-1', changeType: 'CREATED', description: 'Created' }]
    mockFindMany.mockResolvedValueOnce(mockHistory as never)

    const result = await getProjectHistory('project-1')

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { projectId: 'project-1' },
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
      orderBy: { createdAt: 'desc' },
    })
    expect(result).toEqual(mockHistory)
  })

  it('returns empty array when no history exists', async () => {
    mockFindMany.mockResolvedValueOnce([] as never)

    const result = await getProjectHistory('project-nonexistent')

    expect(result).toEqual([])
  })

  it('propagates database errors to the caller', async () => {
    mockFindMany.mockRejectedValueOnce(new Error('DB read failed'))

    await expect(getProjectHistory('project-1')).rejects.toThrow('DB read failed')
  })
})
