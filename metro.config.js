const { getDefaultConfig } = require("@expo/metro-config");

/** @type {import('@expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  ...defaultConfig,
  // Add any custom Metro configuration here if needed
};

module.exports = config;
