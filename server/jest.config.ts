import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

/* 
  This is the jest config file for all tests going forward.
  When creating unit tests, we should aim to avoid involving
  the database, we want tests to be as fast as possible and 
  to test the business logic is correct, not that the code 
  can correctly connect to a database or API.
*/

const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/'],
  testMatch: ['**/*.test.ts', '!**/*db.test.ts', '**/*.steps.ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/src/',
  }),
  maxWorkers: '80%',
  transform: {
    '\\.[jt]sx?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/'],
  // Preserves old snapshot format
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
  collectCoverage: false,
  coverageDirectory: '../../test-coverage/api',
  coveragePathIgnorePatterns: ['/node_modules/'],
  // Text returns coverage in console so engineers can understand coverage prior to raising PRs
  coverageReporters: ['lcov', 'text'],
  // No global thresholds set at present, need to get a better idea of where we are at.
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  workerIdleMemoryLimit: '512M',
};

export default config;
