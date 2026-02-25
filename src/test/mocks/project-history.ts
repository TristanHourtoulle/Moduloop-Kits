import { vi } from 'vitest'

/**
 * Creates a mock for `@/lib/services/project-history` module.
 */
export function createProjectHistoryMock() {
  return {
    createProjectCreatedHistory: vi.fn().mockResolvedValue(undefined),
    createProjectUpdatedHistory: vi.fn().mockResolvedValue(undefined),
    createProjectDeletedHistory: vi.fn().mockResolvedValue(undefined),
    createKitAddedHistory: vi.fn().mockResolvedValue(undefined),
    createKitRemovedHistory: vi.fn().mockResolvedValue(undefined),
    createKitQuantityUpdatedHistory: vi.fn().mockResolvedValue(undefined),
    getProjectHistory: vi.fn(),
    recordProjectHistory: vi.fn(),
  }
}
