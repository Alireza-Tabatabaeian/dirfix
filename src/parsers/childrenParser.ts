import {ParseOptions, ParsingResult} from "../core/types"
import {ParsedComponent} from "../core/ParsedComponent"
import {nodeParser} from "./nodeParser"

export const childrenParser = (
    children: NodeListOf<ChildNode>,
    node: Partial<Node>,
    parseOptions: ParseOptions = {}
): ParsingResult => {

    const parsedComponents: ParsedComponent[] = []

    let ltr: number = 0
    let rtl: number = 0

    let containsNeutral: boolean = false
    let multipleWord: boolean = false

    let voidTagsCounter: number = 0

    for (const child of children) {
        const parsedChild = nodeParser(child as Element, node, parseOptions)
        if (parsedChild.type === 'VoidTag') {
            voidTagsCounter++
            parsedComponents.push(parsedChild)
            continue
        }

        ltr += parsedChild.preferredDirection() === 'ltr' ? 1:0
        rtl += parsedChild.preferredDirection() === 'rtl' ? 1:0

        containsNeutral = containsNeutral || parsedChild.containsNeutrals
        multipleWord = multipleWord || parsedChild.multipleWords
        parsedComponents.push(parsedChild)
    }

    return {
        children: parsedComponents,
        context: {
            ltr, rtl
        },
        containsNeutral,
        multipleWords: multipleWord || (parsedComponents.length - voidTagsCounter > 1)
    }
}