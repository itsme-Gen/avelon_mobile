const { getDefaultConfig } = require("expo/metro-config");
const path = require('path');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Allow Metro to resolve the local @avelon_capstone/types package
const avelonTypesPath = path.resolve(__dirname, '../avelon_types');
config.watchFolders = [avelonTypesPath];
config.resolver.nodeModulesPaths = [
    path.resolve(__dirname, 'node_modules'),
    path.resolve(avelonTypesPath, 'node_modules'),
];

module.exports = withNativeWind(config, { input: './src/styles/global.css' })