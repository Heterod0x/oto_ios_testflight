const { withNativeWind: withNativeWind } = require('nativewind/metro');

// metro.config.js
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix: allow Metro to resolve .ts files when .js is imported
config.resolver.sourceExts.push('ts', 'tsx');

// Rewrite bad `.js` imports to point to `.ts`
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.endsWith('.js')) {
    const tsModule = moduleName.replace(/\.js$/, '.ts');
    try {
      return context.resolveRequest(context, tsModule, platform);
    } catch {}
  }
  return context.resolveRequest(context, moduleName, platform);
};

const resolveRequestWithPackageExports = (context, moduleName, platform) => {
  if (moduleName === 'isows') {
    const ctx = {
      ...context,
      unstable_enablePackageExports: false,
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }

  // Package exports in `zustand@4` are incompatible, so they need to be disabled
  if (moduleName.startsWith('zustand')) {
    const ctx = {
      ...context,
      unstable_enablePackageExports: false,
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }

  if (moduleName === 'jose') {
    // https://github.com/privy-io/expo-starter/issues/20
    const ctx = {
      ...context,
      unstable_conditionNames: ['browser'],
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }

  // Handle ox package core module resolution issues
  if (context.originModulePath && context.originModulePath.includes('ox/')) {
    // Handle various ox core module imports
    if (moduleName === '../core/AbiParameters.js') {
      return {
        filePath: require.resolve('./polyfills/AbiParameters.js'),
        type: 'sourceFile',
      };
    }

    if (moduleName === '../core/Hash.js') {
      return {
        filePath: require.resolve('./polyfills/Hash.js'),
        type: 'sourceFile',
      };
    }

    if (moduleName === '../core/Hex.js') {
      return {
        filePath: require.resolve('./polyfills/Hex.js'),
        type: 'sourceFile',
      };
    }

    if (moduleName === '../core/Signature.js') {
      return {
        filePath: require.resolve('./polyfills/Signature.js'),
        type: 'sourceFile',
      };
    }

    if (moduleName === '../core/TypedData.js') {
      return {
        filePath: require.resolve('./polyfills/TypedData.js'),
        type: 'sourceFile',
      };
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.resolveRequest = resolveRequestWithPackageExports;

// Add polyfills for Node.js modules
config.resolver.alias = {
  ...config.resolver.alias,
  crypto: 'react-native-get-random-values',
  stream: 'readable-stream',
  buffer: '@craftzdog/react-native-buffer',
};

// tell Metro to use the SVG transformer
config.transformer.babelTransformerPath = require.resolve(
  'react-native-svg-transformer'
);

// treat .svg as a source file, not an asset
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== 'svg'
);
config.resolver.sourceExts.push('svg');

module.exports = withNativeWind(config, {
  input: './global.css',
});
