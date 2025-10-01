# @rahyafthi/dirfix

**Smart automatic `<span dir>` fixer for mixed LTR/RTL HTML.**  
Keeps your text readable with minimal spans, even when Arabic/Persian and English are mixed in the same content.

---

## ✨ Why?

Browsers often get confused when you mix LTR (English) and RTL (Persian/Arabic/Hebrew) text:

```html
<p dir="rtl">
  سفارش No 56147 آماده است.
</p>
```

Numbers and Latin words may “stick” to the wrong side or flip.

**dirfix** analyzes the text at the word/phrase level and wraps only the parts that need explicit direction, producing clean, minimal markup.

---

## 🚀 Features

- 🔄 Automatic `<span dir>` wrapping — **minimal spans**, no span spam
- 🧠 Heuristic grouping: multi-word opposite runs become **one span**
- ⚖️ Handles neutrals (digits, punctuation, parentheses) gracefully
- 🔍 Decodes HTML entities (`&amp;nbsp;`, `&amp;`, …) safely
- 🪄 Configurable:
    - `normalizeSpaces` → turn NBSP into plain space
    - `decodeTwice` → resolve double-encoded entities (`&amp;nbsp; → &nbsp; → space`)
    - custom entity maps
    - custom void tags (`<br>`, `<img>`, …)
    - custom DOM factory for Node/SSR
- ⚡ Works in browsers (native `DOMParser`) and Node/CLI (custom or jsdom factory)
- 📦 Dual build: ESM + CJS, plus a CLI tool

---

## 📦 Installation

```bash
npm i @rahyafthi/dirfix
```

---

## 🖥 Usage (Library)

```ts
// ESM
import { dirFix } from '@rahyafthi/dirfix'

// CJS
// const { dirFix } = require('@rahyafthi/dirfix')

const input = `
  سلام (gamification) یکی از روش‌های جذاب است.
`

dirFix(input, 'rtl', {
  decodeOptions: { normalizeSpaces: true },
  parseOptions: {}
}).then(output => {
    console.log(output)
})
```

Output:

```html
سلام 
<span dir="ltr">(gamification)</span>
یکی از روش‌های جذاب است.
```

---

## 🛠 CLI Usage

""" COMING SOON """
```bash
# Scoped package via npx
npx @rahyafthi/dirfix --help

# Or run the bin name from the package
npx -p @rahyafthi/dirfix dirfix input.html output.html
```

**Options:**
```
-d, --dir <ltr|rtl|null>   Default container direction (default: ltr)
-n, --normalizeSpaces      Convert NBSP-like spaces to U+0020 (default: false)
-t, --decodeTwice          Decode entities twice (default: true)
-v, --voidTags <csv>       Extra void tags, e.g. "custom,widget"
    --trimSpaces           Trim leading inter-part spaces (default: false)
    --fileMode             Treat input as full HTML file (skip <head>)
-q, --wrapQuery <attr>     Sentinel attribute for wrapper (default: data-dirfix-root="1")
-F, --domFactory <path>    Path to a custom DOM factory module (optional)
```

Examples:
```bash
npx -p @rahyafthi/dirfix dirfix -d rtl -n input.html output.html
npx -p @rahyafthi/dirfix dirfix --voidTags br,hr --trimSpaces input.html
npx -p @rahyafthi/dirfix dirfix --domFactory ./linkedomFactory.mjs input.html
```

---

## ⚙️ API

```ts
async dirFix(html: string, defaultDir: 'ltr' | 'rtl' | null, options?: DirFixOptions): Promise<string>
```

### `DirFixOptions`

```ts
type HTMLSymbol = { symbol: string; unicode: string }

type DomFactory = (html: string, innerFactory?: DomFactory) => HTMLElement

type DirFixOptions = {
  decodeOptions?: {
    normalizeSpaces?: boolean   // default: false
    decodeTwice?: boolean       // default: true
    customEntities?: HTMLSymbol[]
  }
  parseOptions?: {
    customVoidTags?: string[]
    trimSpaces?: boolean                 // default: false
    customDomFactory?: DomFactory        // Node/SSR hook; defaults to internal
    customWrapQuery?: string             // sentinel attribute; default: data-dirfix-root="1"
  }
  fileMode?: boolean                     // true when input is a full HTML file
}
```

**Custom DOM factory (advanced)**
```js
// linkedomFactory.mjs (ESM)
import { parseHTML } from 'linkedom'
export default function linkedomFactory(html) {
  const { document } = parseHTML(`<!doctype html><body>${html}</body>`)
  return document.body
}
```

Use it in CLI:
```bash
npx -p @rahyafthi/dirfix dirfix --domFactory ./linkedomFactory.mjs input.html
```

---

## 🧪 Testing

```bash
npm test
```

Uses Jest + jsdom (or a custom factory) to simulate DOM parsing. Tests cover:
- LTR and RTL runs
- Neutral punctuation and digits
- Nested tags (`<strong>`, `<em>`)
- Void elements (`<br>`, `<img>`)
- Scripts (`<script>`)
- Entity decoding
- `fileMode` on full HTML files

---

## 🎬 Demo GIF

Showcase the problem and solution in ~10s:

1. **The problem:** HTML snippet with mixed Farsi + English; parentheses flip. Add ❌ overlay.
2. **The fix:** Run `dirfix` (CLI or library). Console shows clean `<span dir>` output.
3. **The result:** Browser preview shows correct text order. Add ✅ overlay.

*(COMING SOON)*

---

## 🧩 Troubleshooting

- **TS “Cannot find module '@rahyafthi/dirfix'”** → set `"moduleResolution": "Bundler"` or `"NodeNext"` in your tsconfig.
- **Node/CLI without a DOM** → either rely on the default factory that uses a DOM implementation, or pass your own `customDomFactory` (e.g., linkedom).
- **Node version** → Node 18+ is recommended (modern DOM libs & ESM resolution).

---

## 🔧 Development

Build for both ESM and CJS:

```bash
npm run build
```

Outputs:
- `dist/esm/index.js`
- `dist/cjs/index.js`
- `dist/types/index.d.ts`

---

## 📜 License

MIT © [Alireza Tabatabaeian](https://github.com/Alireza-Tabatabaeian)

