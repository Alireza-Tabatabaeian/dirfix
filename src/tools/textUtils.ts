import {DecodeOptions} from "../core/types"

export function decodeHtmlEntities(input: string, decodeOptions: DecodeOptions = {}): string {
    const {normalizeSpaces = false, decodeTwice = true, customEntities = []} = decodeOptions

    // Try the browser’s HTML parser for full named-entity coverage
    const useDomParser = typeof window !== 'undefined' && typeof DOMParser !== 'undefined'

    const decodeOnce = (s: string): string => {
        let out = s

        if (useDomParser) {
            // DOMParser decodes both named and numeric entities
            const doc = new DOMParser().parseFromString(`<!doctype html><body>${s}`, 'text/html')
            out = doc.body.textContent ?? ''
        } else {
            // In case of Node or non-DOM fallback:
            // 1) numeric (decimal and hex)
            out = out.replace(/&#(x?)([0-9a-fA-F]+);/g, (_, isHex: string, num: string) => {
                const codePoint = parseInt(num, isHex ? 16 : 10)
                if (!Number.isFinite(codePoint)) return _
                try {
                    return String.fromCodePoint(codePoint)
                } catch {
                    return _
                }
            });

            // 2) common named entities (extend as needed)
            const named: Record<string, string> = {
                amp: '&',
                lt: '<',
                gt: '>',
                quot: '"',
                apos: "'",
                nbsp: '\u00A0',
                ensp: '\u2002',
                emsp: '\u2003',
                thinsp: '\u2009',
                ndash: '\u2013',
                mdash: '\u2014',
                hellip: '\u2026',
                copy: '\u00A9',
                reg: '\u00AE',
                trade: '\u2122',
                laquo: '\u00AB',
                raquo: '\u00BB',
                lsquo: '\u2018',
                rsquo: '\u2019',
                ldquo: '\u201C',
                rdquo: '\u201D',
                euro: '\u20AC',
                pound: '\u00A3',
                yen: '\u00A5',
                sect: '\u00A7',
                para: '\u00B6',
                middot: '\u00B7',
                bull: '\u2022',
                divide: '\u00F7',
                times: '\u00D7',
                plusmn: '\u00B1',
                micro: '\u00B5',
            }

            // add entities added by user
            for (const htmlSymbol of customEntities) {
                named[htmlSymbol.symbol] = htmlSymbol.unicode
            }

            out = out.replace(/&([a-zA-Z][a-zA-Z0-9]+);/g, (m, name: string) => (named[name] ?? m))
        }

        if (normalizeSpaces) {
            // Convert various no-break spaces to plain U+0020
            out = out.replace(/[\u00A0\u2007\u202F]/g, ' ')
        }
        return out
    }

    let result = decodeOnce(input)
    if (decodeTwice && result.includes('&')) {
        result = decodeOnce(result)
    }
    return result
}

