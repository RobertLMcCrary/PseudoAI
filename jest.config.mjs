import nextJest from 'next/jest.js'
 
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})
 
// Add any custom config to be passed to Jest
const config = {
    coverageProvider: 'v8',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapping: {
      '^@/(.*)$': '<rootDir>/src/$1',
    },
    testMatch: [
        '<rootDir>/**/*.{test,spec}.{js,jsx,ts,tsx}'
      ],
      transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$|@clerk|@huggingface))'
      ],
  }
 
// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)