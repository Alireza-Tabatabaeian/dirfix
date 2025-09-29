import {DomFactory} from "../types"
import * as jsdom from "jsdom";

export const jsDomFactory: DomFactory = (html: string) => {
    try {
        const { JSDOM } = jsdom
        const dom = new JSDOM(`<!doctype html><body>${html}</body>`)
        return {element: dom.window.document.body as HTMLElement, node: dom.window.Node}
    }
    catch (e) {
        return undefined
    }

}