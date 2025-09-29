import type { Config } from 'jest'

const config: Config = {
    displayName: 'esm',
    testEnvironment: 'node',
    // IMPORTANT for ESM tests
    extensionsToTreatAsEsm: ['.ts'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.esm.json', // uses ESNext + Bundler
                useESM: true,                  // <— key flag
                isolatedModules: true,         // optional but often faster
            },
        ],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'json'],
    testMatch: ['**/__tests__/**/*.esm.(test|spec).ts'],
    // If your package.json has "type": "module", keep this; otherwise, still OK
    // to run ESM tests because ts-jest emits ESM for the transformer.
}

export default config
