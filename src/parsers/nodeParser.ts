import {ParsedComponent} from "../core/ParsedComponent"
import {textParser} from "./textParser"
import {isVoidTag} from "../tools/elementUtils"
import {childrenParser} from "./childrenParser"
import {ParseOptions} from "../core/types"
import {DOMHandler} from "../core/DOMHandler";

/**
 *
 *
 *
 * @param element
 * @param domHandler
 * @param parseOptions
 */
export const nodeParser =
    (element: Element, node: Partial<Node>, parseOptions: ParseOptions = {}): ParsedComponent => {
        const {customVoidTags = [], trimSpaces = false} = parseOptions
        if (element.nodeType === node.TEXT_NODE) {
            const parsedComponent = new ParsedComponent('Text')
            const parsedResult = textParser(element.textContent ?? '', trimSpaces)
            parsedComponent.children = parsedResult.children

            parsedComponent.ltrCount = parsedResult.context.ltr
            parsedComponent.rtlCount = parsedResult.context.rtl

            return parsedComponent
        }

        const el = element as Element
        if (isVoidTag(el, customVoidTags)) {
            return new ParsedComponent('VoidTag', el)
        }

        const parsedComponent = new ParsedComponent('Element', el)
        const parsedChildren = childrenParser(el.childNodes,node, parseOptions)

        parsedComponent.children = parsedChildren.children

        parsedComponent.ltrCount = parsedChildren.context.ltr
        parsedComponent.rtlCount = parsedChildren.context.rtl

        return parsedComponent
    }