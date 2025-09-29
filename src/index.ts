import * as CharUtilities from './tools/charUtils'
import {jsDomFactory} from "./core/addons/jsdomFactory";

// High-level API
export {dirFix} from './dirfix'

// Types
export type {
    DirFixOptions,
    Direction,
    DecodeOptions,
    ParseOptions,
    HTMLSymbol
} from './core/types'

// Utilities
export {decodeHtmlEntities} from './tools/textUtils'
export {CharUtilities}

// String to DOM
export {DOMHandler} from './core/DOMHandler'
export {jsDomFactory} from './core/addons/jsdomFactory'

