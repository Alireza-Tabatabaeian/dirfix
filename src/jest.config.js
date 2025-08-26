import {createDefaultPreset} from "ts-jest"

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
    testEnvironment: "jsdom",
    testMatch: ['**/__tests__/**/*.test.ts'],
    transform: {
        ...tsJestTransformCfg,
    },
}