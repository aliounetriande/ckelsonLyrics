module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    '/node_modules/(?!axios)', // Transformer axios et ses dépendances
  ],
};