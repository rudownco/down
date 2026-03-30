const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind }   = require('nativewind/metro');
const path = require('path');

const projectRoot  = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../');

const config = getDefaultConfig(projectRoot);

// Watch all packages in the monorepo
config.watchFolders = [monorepoRoot];

// Resolve modules from the workspace root so @down/common is found
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Prefer .native.tsx over .tsx for platform-specific components in @down/common
config.resolver.sourceExts = [
  'native.tsx', 'native.ts', 'native.js',
  ...config.resolver.sourceExts,
];

module.exports = withNativeWind(config, { input: './global.css' });
