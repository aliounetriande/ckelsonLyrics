module.exports = {
  jest: (config) => {
    config.transformIgnorePatterns = [
      '/node_modules/(?!axios)', // Transformer axios et ses dépendances
    ];
    return config;
  },
};