# dirfix

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

renders inconsistently — numbers and Latin words may “stick” to the wrong side or flip.

**dirfix** analyzes the text at the word/phrase level and wraps only the parts that need explicit direction, producing clean, minimal markup.

---

## 🚀 Features

* 🔄 Automatic `<span dir>` wrapping — minimizes span spam
* 🧠 Heuristic grouping: multi-word opposite runs become **one span**
* ⚖️ Handles neutrals (digits, punctuation, parentheses) gracefully
* 🔍 Decodes HTML entities (`&amp;nbsp;`, `&amp;`, etc.) safely
* 🪄 Configurable:

    * `normalizeSpaces` → turn NBSP into plain space
    * `decodeTwice` → resolve double-encoded entities (`&amp;nbsp; → &nbsp; → space`)
    * custom entity maps
    * custom void tags (`<br>`, `<img>`, …)
* ⚡ Works in browsers (native `DOMParser`) and Node/CLI (falls back to `jsdom`)
* 📦 Dual build: ESM + CJS, plus a CLI tool

---

## 📦 Installation

```bash
npm install dirfix
```

---

## 🖥 Usage (Library)

```ts
import { dirFix } from 'dirfix'

const input = `
  سلام (gamification) یکی از روش‌های جذاب است.
`

const output = dirFix(input, 'rtl', {
  decodeOptions: { normalizeSpaces: true },
  parseOptions: {}
})

console.log(output)
```

Output:

```html
سلام 
<span dir="ltr">
    (gamification)
</span>
یکی از روش‌های جذاب است.
```

---

## 🛠 CLI Usage

```bash
npx dirfix input.html output.html
```

* First argument: input HTML file
* Second argument (optional): output file. If omitted, prints to stdout.
* Default direction: `ltr` (can be configured in future versions with flags).

---

## ⚙️ API

```ts
dirFix(html: string, defaultDir: 'ltr' | 'rtl' | null, options?: DirFixOptions): string
```

### `DirFixOptions`

```ts
type DirFixOptions = {
  decodeOptions?: {
    normalizeSpaces?: boolean   // default: false
    decodeTwice?: boolean       // default: true
    customEntities?: { symbol: string; unicode: string }[]
  },
  parseOptions?: {
    customVoidTags?: string[]
  }
}
```

---

## 🧪 Testing

```bash
npm test
```

Uses Jest + jsdom for DOM parsing simulation. Tests cover:

* LTR and RTL runs
* Neutral punctuation and digits
* Nested tags (`<strong>`, `<em>`)
* Void elements (`<br>`, `<img>`)
* Entity decoding

---

## 🎬 Demo GIF

Showcase the problem and solution in \~10s:

1. **The problem:** HTML snippet with mixed Farsi + English; parentheses flip. Add ❌ overlay.
2. **The fix:** Run `dirfix` (CLI or library). Console shows clean `<span dir>` output.
3. **The result:** Browser preview shows correct text order. Add ✅ overlay.

*(Insert your recorded GIF here)*

---

## 🔧 Development

Build for both ESM and CJS:

```bash
npm run build
```

Outputs:

* `dist/esm/index.js`
* `dist/cjs/index.js`
* `dist/types/index.d.ts`

---

## 📜 License

MIT © [Alireza Tabatabaeian](https://github.com/Alireza-Tabatabaeian)
