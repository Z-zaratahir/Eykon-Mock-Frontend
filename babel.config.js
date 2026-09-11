module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // react-native-reanimated v4 split its Babel plugin out into
    // react-native-worklets — this must be listed last.
    plugins: ["react-native-worklets/plugin"],
  };
};
