const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Allow Metro to resolve the local @avelon_capstone/types package if it exists.
// Guard the watch/resolver setup so Metro doesn't crash when the folder is absent.
const avelonTypesPath = path.resolve(__dirname, "../avelon_types");
if (fs.existsSync(avelonTypesPath)) {
  config.watchFolders = [avelonTypesPath];
  config.resolver.nodeModulesPaths = [
    path.resolve(__dirname, "node_modules"),
    path.resolve(avelonTypesPath, "node_modules"),
  ];
} else {
  // Folder not present — skip adding it to watchFolders to avoid ENOENT
  config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];
}

module.exports = withNativeWind(config, { input: "./src/styles/global.css" });
