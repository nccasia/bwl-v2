/* eslint-disable @typescript-eslint/no-require-imports */
const { composePlugins, withNx } = require('@nx/webpack');
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');

module.exports = composePlugins(withNx(), (config) => {
  return {
    ...config,
    output: {
      ...config.output,
      path: path.resolve(__dirname, 'dist/apps/server'),
    },
  };
});
