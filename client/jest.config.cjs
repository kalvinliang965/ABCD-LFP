module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^yaml$': '<rootDir>/src/__mocks__/yaml.ts',
    '^../utils/StateYamlParser$': '<rootDir>/src/__mocks__/StateYamlParser.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
