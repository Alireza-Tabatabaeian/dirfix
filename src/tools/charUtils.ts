import {Direction} from "../core/types"

export const isSpace = (ch: string): boolean => {
    return (/[\s\u0020\u00A0]/).test(ch)
}


export function isRTL(ch: string): boolean {
    return /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(ch)
}

export function isLTR(ch: string): boolean {
    return /[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF\u2C00-\uFB1C\u3040-\u30FF\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/.test(ch)
}

export function getDirection(ch: string): Direction {
    if (isRTL(ch)) return 'rtl'
    if (isLTR(ch)) return 'ltr'
    return null
}

export const isDigit = (ch: string) => /[0-9\u0660-\u0669\u06F0-\u06F9]/.test(ch)
export const isNeutral = (ch: string) => /[@.,:\/\-#;!?=&*()\[\]{}<>"'|\\%+^$]/.test(ch)

export const containsNeutrals = (ch: string) => isDigit(ch) || isNeutral(ch)

/**
 *
 * right now the container topic is skipped
 * in future versions the logic should append the container's symbols to the container's content in some situations
 */
export const isOpeningContainer = (ch: string) => /[({\[]/.test(ch)
export const isClosingContainer = (ch: string) => /[)}\]]/.test(ch)

export function getCloser(char: string) {
    switch (char) {
        case '{':
            return '}'
        case '(':
            return ')'
        case '[':
            return ']'
        default:
            return null as any
    }
}