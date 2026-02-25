import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'src/lib/utils/product-helpers.ts',
        'src/lib/utils/kit/calculations.ts',
        'src/lib/utils/project/calculations.ts',
        'src/lib/utils/project/status.ts',
        'src/lib/services/project-history.ts',
        'src/app/api/products/route.ts',
        'src/app/api/products/[id]/route.ts',
        'src/app/api/kits/route.ts',
        'src/app/api/kits/[id]/route.ts',
        'src/app/api/projects/route.ts',
        'src/app/api/projects/[id]/route.ts',
        'src/app/api/projects/[id]/kits/route.ts',
        'src/app/api/projects/[id]/kits/[kitId]/route.ts',
        'src/app/api/projects/[id]/history/route.ts',
        'src/app/api/admin/users/route.ts',
        'src/app/api/admin/users/[id]/role/route.ts',
        'src/app/api/profile/route.ts',
        'src/app/api/users/route.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
