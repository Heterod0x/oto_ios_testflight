const { withNativeWind: withNativeWind } = require('nativewind/metro');

// metro.config.js
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const resolveRequestWithPackageExports = (context, moduleName, platform) => {
  if (moduleName === 'jose') {
    // https://github.com/privy-io/expo-starter/issues/20
    const ctx = {
      ...context,
      unstable_conditionNames: ['browser'],
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.resolveRequest = resolveRequestWithPackageExports;

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
