import { fileURLToPath } from 'node:url';

import { configDefaults, defineConfig, type TestProjectInlineConfiguration } from 'vitest/config';

// Workspace packages resolve to their TypeScript source in tests, like in the
// editor and in typecheck (see customConditions in tsconfig.base.json).
const conditions = ['@aeolus-fleet/source', 'module', 'node', 'development|production'];

/**
 * Core's Postgres global setup, by its file: vitest loads a global setup
 * outside the test environment, where a package export does not resolve.
 */
const postgresGlobalSetup = fileURLToPath(
  new URL('node_modules/@aeolus-fleet/core/dist/testing/postgres-global-setup.js', import.meta.url),
);

/**
 * The layers in the order a full run takes them, as each project's name ends
 * (`networking-plugin:integration`). CI runs each layer as its own job; a full
 * local run takes them one after another too, so no layer's time limits
 * compete with another layer's servers and databases on the same machine.
 */
const LAYERS = ['unit', 'integration'];

function inLayerOrder(projects: TestProjectInlineConfiguration[]): TestProjectInlineConfiguration[] {
  return projects.map(withGroupOrder);
}

function withGroupOrder(project: TestProjectInlineConfiguration): TestProjectInlineConfiguration {
  const name = project.test?.name;
  const label = typeof name === 'object' ? name.label : (name ?? '');
  const groupOrder = LAYERS.indexOf(label.split(':').at(-1) ?? '');
  if (groupOrder === -1) {
    throw new Error(`the Vitest project ${label} is in no layer: name it <package>:<${LAYERS.join('|')}>`);
  }
  return { ...project, test: { ...project.test, sequence: { ...project.test?.sequence, groupOrder } } };
}

export default defineConfig({
  resolve: { conditions },
  ssr: { resolve: { conditions } },
  test: {
    // Half the machine per run: the tests start servers and databases beside
    // their workers, and other runs share the machine.
    maxWorkers: '50%',
    // A poll's own default (1 second) holds only on an idle machine.
    expect: { poll: { timeout: 10_000 } },
    projects: inLayerOrder([
      {
        extends: true,
        test: {
          name: 'scripts:unit',
          include: ['scripts/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          // Each guardrail lint rule, proven against the real ESLint config.
          name: 'lint:unit',
          include: ['lint/**/*.test.ts'],
          testTimeout: 30_000,
        },
      },
      {
        extends: true,
        test: {
          name: 'networking-plugin:unit',
          root: 'packages/networking-plugin',
          include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
          exclude: [...configDefaults.exclude, '**/*.integration.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          // The networking plugin on Postgres, against a real fleet server, both in the shared container.
          name: 'networking-plugin:integration',
          root: 'packages/networking-plugin',
          include: ['test/**/*.integration.test.ts'],
          globalSetup: [postgresGlobalSetup],
          testTimeout: 30_000,
          hookTimeout: 180_000,
        },
      },
    ]),
  },
});
