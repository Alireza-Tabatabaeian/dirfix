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
export const defaultDomFactory: DomFactory = async(html, nodeParser?: DomFactory) => {
    if (typeof DOMParser !== 'undefined') {
        const doc = new DOMParser().parseFromString(html, 'text/html')
        return {element: doc.body as HTMLElement, node: Node}
    }
    if(nodeParser == null) {
        throw new Error("In CLI/Node/Jest cases, a node parser should be passed")
    }
    try {
        return await nodeParser(html)
    } catch (e) {
        throw new Error('The input data could not be parsed.')
    }
}

export class DOMHandler {
    static WRAP_QUERY: string = 'data-dirfix-root="1"'

    domFactory: DomFactory
    nodeFactory: Partial<Node> | null = null
    wrapQuery : string

    constructor(customDomFactory?: DomFactory, customWrapQuery?: string) {
        this.domFactory = customDomFactory != null ? customDomFactory : defaultDomFactory
        this.wrapQuery = customWrapQuery? customWrapQuery : DOMHandler.WRAP_QUERY
    }

    async stringToNode(html: string, fileMode: boolean = false):Promise<HTMLElement> {
        if(this.domFactory === undefined){
            throw new Error('DOM environment not available.')
        }
        const raw:string = fileMode ? await this.domFactory(html).then(parser => parser.element.innerHTML) : html
        const {element, node} = await this.domFactory(`<div ${this.wrapQuery}>${raw}</div>`)
        this.nodeFactory = node
        return element.firstChild as HTMLElement
    }

    async extractFinalHTML(rendered: Rendered, dirShouldSet: Direction = null, customWrapQuery: string = DOMHandler.WRAP_QUERY): Promise<string> {

        if(this.domFactory === undefined){
            throw new Error('DOM environment not available.')
        }

        if(rendered === null) {
            return  ''
        }

        try {
            const divElement = await this.domFactory(rendered.text).then(parsed => parsed.element.firstChild as HTMLElement)

            if(divElement === null)
                return ''

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