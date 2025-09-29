import type { Config } from 'jest'

const config: Config = {
    displayName: 'cjs',
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.cjs.json',
                useESM: false,
                isolatedModules: true,
            },
        ],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'json'],
    testMatch: ['**/__tests__/**/*.cjs.(test|spec).ts'],
}

export default config