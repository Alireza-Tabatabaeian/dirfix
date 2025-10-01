import {DomFactory} from "../types"

export const jsDomFactory: DomFactory = async (html: string, fileMode: boolean = false) => {
    try {
        const jsdom = await import("jsdom")
        const {JSDOM} = jsdom
        const dom = new JSDOM(fileMode ? html : `<!doctype html><body>${html}</body>`)
        return {element: dom.window.document.body as HTMLElement, node: dom.window.Node}
    } catch {
        throw new Error('jsdom is not installed or couldn\'t parse the text')
    }
}