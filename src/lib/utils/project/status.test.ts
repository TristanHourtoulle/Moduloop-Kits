import { describe, it, expect } from 'vitest';
import { ProjectStatus } from '@/lib/types/project';
import { getStatusConfig, getStatusColor, getStatusIcon } from './status';

describe('getStatusConfig', () => {
  it('returns green config for ACTIF', () => {
    const config = getStatusConfig(ProjectStatus.ACTIF);
    expect(config.color).toBe('bg-green-100 text-green-800');
    expect(config.icon).toBe('🟢');
  });

  it('returns blue config for TERMINE', () => {
    const config = getStatusConfig(ProjectStatus.TERMINE);
    expect(config.color).toBe('bg-blue-100 text-blue-800');
    expect(config.icon).toBe('🔵');
  });

  it('returns yellow config for EN_PAUSE', () => {
    const config = getStatusConfig(ProjectStatus.EN_PAUSE);
    expect(config.color).toBe('bg-yellow-100 text-yellow-800');
    expect(config.icon).toBe('🟡');
  });

  it('returns gray config for ARCHIVE', () => {
    const config = getStatusConfig(ProjectStatus.ARCHIVE);
    expect(config.color).toBe('bg-gray-100 text-gray-800');
    expect(config.icon).toBe('⚫');
  });

  it('returns default config for unknown status', () => {
    const config = getStatusConfig('UNKNOWN_STATUS');
    expect(config.color).toBe('bg-gray-100 text-gray-800');
    expect(config.icon).toBe('⚪');
  });
});

describe('getStatusColor', () => {
  it('returns color classes for known status', () => {
    expect(getStatusColor(ProjectStatus.ACTIF)).toBe('bg-green-100 text-green-800');
  });

  it('returns default color for unknown status', () => {
    expect(getStatusColor('INVALID')).toBe('bg-gray-100 text-gray-800');
  });
});

describe('getStatusIcon', () => {
  it('returns icon for known status', () => {
    expect(getStatusIcon(ProjectStatus.ACTIF)).toBe('🟢');
  });

  it('returns default icon for unknown status', () => {
    expect(getStatusIcon('INVALID')).toBe('⚪');
  });
});
