import {TextRenderer} from "./TextRenderer"
import {Direction, Phrase, Rendered} from "../core/types"
import {attributeToString, newAttr} from "../tools/elementUtils"
import {ParsedComponent} from "../core/ParsedComponent"
import {addPhraseToStack, OpenStack} from "../core/SpanStack"

export const ComponentRenderer = (
    parsedComponent: ParsedComponent,
    outerSpan: OpenStack | null,
    parentDir: Direction,
    space: boolean,
    setDir: boolean = false
): Rendered => {
    if (parsedComponent.type === 'Text') {
        return TextRenderer(parsedComponent.children as Phrase[], outerSpan, parentDir, space)
    }

    if (parsedComponent.element === null)
        return {
            text: '',
            direction: null,
            spanStack: outerSpan,
            space: space,
        }

    const dir = parsedComponent.preferredDirection() ?? parentDir

    const tag = parsedComponent.element.tagName.toLowerCase()
    const attrs: Attr[] = Array.from(parsedComponent.element.attributes)

    // remove default dir property if exist
    const noDirAttrs: Attr[] = attrs.filter(a => a.name !== 'dir')

    if (parsedComponent.type === 'VoidTag') {

        if (tag.toLowerCase() === 'br') // prepend space should be removed if the void tag is br.
            space = false

        const attributes = (noDirAttrs.length > 0) ? ' ' + attributeToString(noDirAttrs) : ''

        const tagOutput = `<${tag}${attributes}>`

        if (outerSpan === null) { // this won't be added inside a span
            return {
                text: tagOutput,
                direction: null,
                spanStack: null,
                space
            }
        } else { // the span is open, add it to the span waiting items so it will print in order
            const tagAsPhrase = {
                text: tagOutput,
                direction: null,
                multipleWords: false,
                containsNeutral: false
            }
            outerSpan.addToWaiting(tagAsPhrase, true)
            return {
                text: '',
                direction: null,
                spanStack: outerSpan,
                space
            }
        }
    }

    let innerText: string = ''
    let innerSpan: OpenStack | null = null

    if (tag.toLowerCase() === 'p') // p tag took sentence to start of the line, so prepend space should be removed
        space = false

    let multipleWords = false
    let containsNeutral = false

    for (const child of parsedComponent.children as ParsedComponent[]) {
        multipleWords = multipleWords || child.multipleWords
        containsNeutral = containsNeutral || child.containsNeutrals
        const renderedChild = ComponentRenderer(child, innerSpan, dir, space)
        innerText += renderedChild.text
        innerSpan = renderedChild.spanStack
        space = renderedChild.space
    }

    if (innerSpan !== null) {
        innerText += `</span>${innerSpan.getWaitingString()}`
    }

    if (dir !== null && (dir !== parentDir || setDir)) {
        noDirAttrs.push(newAttr(parsedComponent.element, 'dir', dir))
    }
    const attributes = (noDirAttrs.length > 0) ? ' ' + attributeToString(noDirAttrs) : ''

    // don't add dir if parent has same dir
    const outerText = `<${tag}${attributes}>${innerText}</${tag}>`

    const renderedComponentAsPhrase = {
        text: outerText,
        direction: dir,
        multipleWords: multipleWords || parsedComponent.children.length > 1,
        containsNeutral: containsNeutral
    }

    if (outerSpan !== null) {
        const {text, spanClosed} = addPhraseToStack(outerSpan, renderedComponentAsPhrase, space)
        if (spanClosed)
            outerSpan = null
        return {
            text,
            direction: dir,
            spanStack: outerSpan,
            space
        }
    }

    return {
        text: renderedComponentAsPhrase.text,
        direction: dir,
        spanStack: outerSpan,
        space
    }
}