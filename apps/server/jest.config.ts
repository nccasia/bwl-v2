import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  rootDir: '../../apps/server',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@base/(.*)$': '<rootDir>/src/base/$1',
    '^@constants$': '<rootDir>/src/constants',
    '^@enums/(.*)$': '<rootDir>/src/enums/$1',
    '^@configs/(.*)$': '<rootDir>/src/configs/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/migrations/**',
    '!src/**/*.module.ts',
    '!src/**/*.controller.ts',
    '!src/main.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  passWithNoTests: true,
};

export default config;
