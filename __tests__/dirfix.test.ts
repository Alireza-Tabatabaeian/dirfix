import {dirFix} from '../src'
import {DirFixOptions} from '../src'
import {EXPECTED_OUTPUT, TEST_INPUT_HTML} from "./inputHtml";

const baseOpts: DirFixOptions = {
    decodeOptions: {normalizeSpaces: true, decodeTwice: true, customEntities: []},
    parseOptions: {customVoidTags: []},
}

describe('dirFix — bidi & entities', () => {

    test('keeps simple single-direction LTR intact', () => {
        const html = 'Hello world.'
        const out = dirFix(html, 'ltr', baseOpts)
        expect(out).toBe('Hello world.')
    })

    test('keeps simple single-direction RTL intact (wrapped root dir is fine)', () => {
        const html = 'سلام دنیا.'
        const out = dirFix(html, 'rtl', baseOpts)
        // should not introduce extra opposite spans
        expect(out).toContain('سلام')
        expect(out).not.toMatch(/<span dir="ltr">/)
    })

    test('mixed phrase inside strong: one coherent opposite span inside the element', () => {
        const html = 'سلام <strong>hello world</strong> دنیا'
        const out = dirFix(html, 'rtl', baseOpts)
        // Strong should remain, with a single LTR span within it (or before/after depending on your renderer)
        expect(out).toBe(`سلام <strong dir="ltr">hello world</strong> دنیا`)
    })

    test('single opposite word should avoid span spam', () => {
        const html = 'سلام hello دنیا'
        const out = dirFix(html, 'rtl', baseOpts)
        const ltrSpans = out.match(/<span dir="ltr">/g) ?? []
        expect(ltrSpans.length).toBeLessThanOrEqual(1)
    })

    test('multi-word opposite phrase groups into one span', () => {
        const html = 'سلام hello amazing world دنیا'
        const out = dirFix(html, 'rtl', baseOpts)
        expect(out).toContain('<span dir="ltr">hello amazing world</span>')
    })

    test('neutrals and punctuation stay in sensible places', () => {
        const html = '(hello) سلام!'
        const out = dirFix(html, 'rtl', baseOpts)
        // we just assert both parts present and no duplicated punctuation
        expect(out).toContain('(hello)')
        expect(out).toContain('سلام!')
    })

    test('numbers inside RTL sentence are stable by splitting', () => {
        const html = 'سفارش No 56147 آماده است.'
        const out = dirFix(html, 'rtl', baseOpts)
        // “No 56147” should be kept logically LTR; either bare or inside a single LTR span
        // Accept either form:
        const okBare = out.includes('No 56147')
        const okSpan = /<span dir="ltr">No 56147<\/span>/.test(out)
        expect(okBare || okSpan).toBe(true)
    })

    test('void tags remain void (no dir injected)', () => {
        const html = 'A <img src="x.jpg"> B'
        const out = dirFix(html, 'ltr', baseOpts)
        expect(out).toContain('<img src="x.jpg">')
        expect(out).not.toContain('<img dir=')
    })

    test('br remains as is and does not create extra spans', () => {
        const html = 'سلام<br>hello'
        const out = dirFix(html, 'rtl', baseOpts)
        expect(out).toContain('<br>')
        // at most one LTR span for the trailing word
        const ltrSpans = out.match(/<span dir="ltr">/g) ?? []
        expect(ltrSpans.length).toBeLessThanOrEqual(1)
    })

    test('entities decode twice (&amp;nbsp; → &nbsp; → space)', () => {
        const html = 'A&amp;nbsp;B'
        const out = dirFix(html, 'ltr', baseOpts)
        expect(out).toContain('A B')
    })

    test('custom entities map', () => {
        const opts: DirFixOptions = {
            ...baseOpts,
            decodeOptions: {
                ...baseOpts.decodeOptions,
                customEntities: [{symbol: 'check', unicode: '✓'}],
            },
        }
        const html = 'OK &check;'
        const out = dirFix(html, 'ltr', opts)
        expect(out).toContain('OK ✓')
    })

    test('defaultDir=null still produces stable output (no dir="")', () => {
        const html = 'hello دنیا'
        const out = dirFix(html, null, baseOpts)
        // sanity: no dir="" on top-level wrappers
        expect(out).not.toContain('dir=""')
    })

    test('complex text with everything', () => {
        const out = dirFix(TEST_INPUT_HTML, 'ltr', baseOpts)
        expect(out).toBe(EXPECTED_OUTPUT)
    })
})
