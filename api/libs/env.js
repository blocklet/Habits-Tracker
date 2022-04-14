const env = require('@blocklet/sdk/lib/env');
const path = require('path');

module.exports = {
  ...env,
  chainHost: process.env.CHAIN_HOST || '',
  projectDir: path.join(env.dataDir, 'projects'),
};
