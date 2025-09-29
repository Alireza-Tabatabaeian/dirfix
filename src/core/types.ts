import {ParsedComponent} from "./ParsedComponent"
import {OpenStack} from "./SpanStack";

export type DirFixOptions = {
    decodeOptions?: DecodeOptions,
    parseOptions?: ParseOptions,
    fileMode?: boolean
}

export type ParseOptions = {
    customDomFactory?: DomFactory
    customWrapQuery?: string
    customVoidTags?: string[]
    trimSpaces?: boolean
}

export type DecodeOptions = {
    normalizeSpaces?: boolean
    decodeTwice?: boolean
    customEntities?: HTMLSymbol[]
}

export type Direction = 'ltr' | 'rtl' | null

export type Word = {
    text: string,
    direction: Direction
    containsNeutral: boolean
}

export type Component = 'Text' | 'VoidTag' | 'Element'

export type Phrase = {
    text: string,
    direction: Direction,
    multipleWords: boolean,
    containsNeutral: boolean
}

export type ParsingResult = {
    children: Array<Phrase | ParsedComponent>
    context: {
        ltr: number
        rtl: number
    }
    containsNeutral: boolean
    multipleWords: boolean
}

export type HTMLSymbol = {
    symbol : string,
    unicode : string
}

export type Rendered = {
    text: string,
    direction: Direction,
    spanStack: OpenStack | null,
    space: boolean
} | null

export type StackAddResult = {
    text: string,
    spanClosed: boolean
}

export type DomFactory = (html: string) => {element: HTMLElement, node: Partial<Node>}