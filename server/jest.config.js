module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
      '^.+\\.(ts|tsx)$': 'babel-jest'
    },
    transformIgnorePatterns: [
      '/node_modules/(?!(datastructures-algorithms-ts)/)'
    ],
    testMatch: [
      '**/__tests__/**/*.test.ts',    // 匹配 __tests__ 目录
      '**/?(*.)+(spec|test).ts'       // 匹配任意目录的 .test.ts 文件
    ],
    testPathIgnorePatterns: [
      '/node_modules/',
      '/dist/'                        // 如果有编译输出目录需要排除
    ],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1'
    }
  };