import {dirFix} from '../src'
import {DirFixOptions} from '../src'
import jsDomFactory from "jsdomfactory"
import {EXPECTED_OUTPUT_RTL, EXPECTED_OUTPUT_LTR, TEST_INPUT_HTML} from "./testData"

const baseOpts: DirFixOptions = {
    decodeOptions: {normalizeSpaces: true, decodeTwice: true, customEntities: []},
    parseOptions: {customDomFactory: jsDomFactory, customVoidTags: []},
}

describe('dirFix — bidi & entities', () => {

    test('keeps simple single-direction LTR intact', async () => {
        const html = 'Hello world.'
        const out = await dirFix(html, 'ltr', baseOpts)
        expect(out).toBe('Hello world.')
    })

    test('keeps simple single-direction RTL intact (wrapped root dir is fine)', async () => {
        const html = 'سلام دنیا.'
        const out = await dirFix(html, 'rtl', baseOpts)
        // should not introduce extra opposite spans
        expect(out).toContain('سلام')
        expect(out).not.toMatch(/<span dir="ltr">/)
    })

    test('mixed phrase inside strong: one coherent opposite span inside the element', async () => {
        const html = 'سلام <strong>hello world</strong> دنیا'
        const out = await dirFix(html, 'rtl', baseOpts)
        // Strong should remain, with a single LTR span within it (or before/after depending on your renderer)
        expect(out).toBe(`سلام <strong dir="ltr">hello world</strong> دنیا`)
    })

    test('single opposite word should avoid span spam', async () => {
        const html = 'سلام hello دنیا'
        const out = await dirFix(html, 'rtl', baseOpts)
        const ltrSpans = out.match(/<span dir="ltr">/g) ?? []
        expect(ltrSpans.length).toBeLessThanOrEqual(1)
    })

    test('multi-word opposite phrase groups into one span', async () => {
        const html = 'سلام hello amazing world دنیا'
        const out = await dirFix(html, 'rtl', baseOpts)
        expect(out).toContain('<span dir="ltr">hello amazing world</span>')
    })

    test('neutrals and punctuation stay in sensible places', async () => {
        const html = '(hello) سلام!'
        const out = await dirFix(html, 'rtl', baseOpts)
        // we just assert both parts present and no duplicated punctuation
        expect(out).toContain('(hello)')
        expect(out).toContain('سلام!')
    })

    test('numbers inside RTL sentence are stable by splitting', async () => {
        const html = 'سفارش No 56147 آماده است.'
        const out = await dirFix(html, 'rtl', baseOpts)
        // “No 56147” should be kept logically LTR; either bare or inside a single LTR span
        // Accept either form:
        const okBare = out.includes('No 56147')
        const okSpan = /<span dir="ltr">No<\/span> 56147/.test(out)
        expect(okBare || okSpan).toBe(true)
    })

    test('void tags remain void (no dir injected)', async () => {
        const html = 'A <img src="x.jpg"> B'
        const out = await dirFix(html, 'ltr', baseOpts)
        expect(out).toContain('<img src="x.jpg">')
        expect(out).not.toContain('<img dir=')
    })

    test('br remains as is and does not create extra spans', async () => {
        const html = 'سلام<br>hello'
        const out = await dirFix(html, 'rtl', baseOpts)
        expect(out).toContain('<br>')
        // at most one LTR span for the trailing word
        const ltrSpans = out.match(/<span dir="ltr">/g) ?? []
        expect(ltrSpans.length).toBeLessThanOrEqual(1)
    })

    test('entities decode twice (&amp;nbsp; → &nbsp; → space)', async () => {
        const html = 'A&amp;nbsp;B'
        const out = await dirFix(html, 'ltr', baseOpts)
        expect(out).toContain('A B')
    })

    test('custom entities map', async () => {
        const opts: DirFixOptions = {
            ...baseOpts,
            decodeOptions: {
                ...baseOpts.decodeOptions,
                customEntities: [{symbol: 'check', unicode: '✓'}],
            },
        }
        const html = 'OK &check;'
        const out = await dirFix(html, 'ltr', opts)
        expect(out).toContain('OK ✓')
    })

    test('defaultDir=null still produces stable output (no dir="")', async () => {
        const html = 'hello دنیا'
        const out = await dirFix(html, null, baseOpts)
        // sanity: no dir="" on top-level wrappers
        expect(out).not.toContain('dir=""')
    })

    test('complex text with everything in ltr parent', async () => {
        const out = await dirFix(TEST_INPUT_HTML, 'ltr', baseOpts)
        expect(out).toBe(EXPECTED_OUTPUT_LTR)
    })

    test('complex text with everything in rtl parent', async () => {
        const out = await dirFix(TEST_INPUT_HTML, 'rtl', baseOpts)
        expect(out).toBe(EXPECTED_OUTPUT_RTL)
    })

    test('it should bypass scripts', async () => {
        const html = `Check this test:<br><div id="test">اینجا ما یکسری جمله فارسی داریم فقط، واضحه؟</div><script>el = document.getElementById('test');el.innerText="And now it's converted to English"</script>`
        const expected_output = `Check this test:<br><div id="test" dir="rtl">اینجا ما یکسری جمله فارسی داریم فقط، واضحه؟</div><script>el = document.getElementById('test');el.innerText="And now it's converted to English"</script>`
        const out = await dirFix(html, 'ltr', baseOpts)
        expect(out).toBe(expected_output)
    })

    test('strange case', async () => {
        const mixedData = `<p>این یک متن آزمایشی است (it includes English words) و حتی a full sentence داخل متن فارسی.<br/>حالا اعداد: 12345 و اعداد فارسی ۱۲۳۴۵.<br/>Mixed punctuation: <strong>سلام؟ hello!</strong> (آیا کار میکند؟) yes/no.<br/>یک ایمیل: text@example.com و یک URL: https://example.com/page?foo-a&bar=2<br/>و در آخر یک کلمه فارسی با حروف لاتین: Farsi.</p>`
        const expected_output = `<p dir="rtl">این یک متن آزمایشی است <span dir="ltr">(it includes English words)</span> و حتی <span dir="ltr">a full sentence</span> داخل متن فارسی.<br/>حالا اعداد: 12345 و اعداد فارسی ۱۲۳۴۵.<br/><span dir="ltr">Mixed punctuation:</span> <strong>سلام؟ <span dir="ltr">hello!</span></strong> (آیا کار میکند؟) <span dir="ltr">yes/no.</span><br/>یک ایمیل: <span dir="ltr">text@example.com</span> و یک <span dir="ltr">URL: https://example.com/page?foo-a&bar=2</span><br/>و در آخر یک کلمه فارسی با حروف لاتین: <span dir="ltr">Farsi.</span></p>`
        const out = await dirFix(mixedData, 'ltr', {parseOptions:{customDomFactory:jsDomFactory}})
        expect(out).toBe(expected_output)
    })
})
