const { composePlugins, withNx } = require('@nx/jest/plugins');

module.exports = composePlugins(withNx(), (config) => {
  return {
    ...config,
    transform: {
      '^.+\\.[tj]s$': [
        'ts-jest',
        {
          tsconfig: '<rootDir>/tsconfig.base.json',
        },
      ],
    },
    moduleFileExtensions: ['ts', 'js', 'json'],
    coverageDirectory: '<rootDir>/coverage',
    collectCoverageFrom: ['**/*.ts', '**/*.tsx', '!**/*.spec.ts'],
  };
});
