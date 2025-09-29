import {Direction, DomFactory, Rendered} from "./types"
import {attributeToString, newAttr} from "../tools/elementUtils"

/**
 * Warning: For Node/CLI/JEST a DomFactory function is needed.
 * The jsDomFactory exists as a ready to use instance however,
 * it depends on "jsdom" library, so make sure it's installed
 * before using it.
 *
 * @param html
 * @param nodeParser
 *
 * The custom nodeParser is expected to return the body part.
 */
export const defaultDomFactory: DomFactory = (html, nodeParser?: DomFactory) => {
    if (typeof DOMParser !== 'undefined') {
        const doc = new DOMParser().parseFromString(html, 'text/html')
        return {element: doc.body as HTMLElement, node: Node}
    }
    try {
        return nodeParser(html)
    } catch (e) {
        throw new Error(
            'DOM environment not available. In Node/CLI/Jest, install "jsdom" or provide a custom factory.'
        )
    }
}

export class DOMHandler {
    static WRAP_QUERY: string = 'data-dirfix-root="1"'

    domFactory: DomFactory
    nodeFactory: Partial<Node> | null = null
    wrapQuery : string

    constructor(customDomFactory?: DomFactory, customWrapQuery?: string) {
        this.domFactory = customDomFactory? customDomFactory : defaultDomFactory
        this.wrapQuery = customWrapQuery? customWrapQuery : DOMHandler.WRAP_QUERY
    }

    stringToNode(html: string, fileMode: boolean = false):HTMLElement {
        const raw:string = fileMode ? this.domFactory(html).element.innerHTML : html
        const {element, node} = this.domFactory(`<div ${this.wrapQuery}>${raw}</div>`)
        this.nodeFactory = node
        return element.firstChild as HTMLElement
    }

    extractFinalHTML(rendered: Rendered, dirShouldSet: Direction = null, customWrapQuery: string = DOMHandler.WRAP_QUERY): string {
        try {
            const divElement = this.domFactory(rendered.text).element.firstChild as HTMLElement

            if(!dirShouldSet)
                return divElement.innerHTML

            if(divElement.childNodes.length > 1)
                return `<span dir="${dirShouldSet}">${divElement.innerHTML}</span>`

            const onlyChild = divElement.firstChild as HTMLElement
            const grandChild = onlyChild.innerHTML

            const tag = onlyChild.tagName.toLowerCase()
            const attrs = Array.from(onlyChild.attributes)

            attrs.push(newAttr(onlyChild,'dir', dirShouldSet))
            const attributes = attributeToString(attrs)

            return `<${tag} ${attributes}>${grandChild}</${tag}>`

        } catch {
            const innerText = peelBySentinel(rendered.text, customWrapQuery)
            return dirShouldSet !== null ? `<span dir="${dirShouldSet}">${innerText}</span>`  : innerText
        }

    }
}

const peelBySentinel = (html: string, marker: string): string => {
    const pos = html.indexOf(marker)
    if (pos === -1) return html

    const openTagEnd = html.indexOf('>', pos)
    if (openTagEnd === -1) return html

    // naive close finder: assumes the sentinel wrapper is a single <div> with a matching </div>
    const closeTagStart = html.lastIndexOf('</div>')
    if (closeTagStart === -1 || closeTagStart <= openTagEnd) return html

    return html.slice(openTagEnd + 1, closeTagStart)
}