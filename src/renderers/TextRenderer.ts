import {Direction, Phrase, Rendered} from "../core/types"
import {addPhraseToStack, OpenStack} from "../core/SpanStack"

export const TextRenderer = (
    phrases: Phrase[],
    outerSpan: OpenStack | null,
    parentDirection: Direction,
    space: boolean
): Rendered => {
    let output = ''

    for (const phrase of phrases) {
        if (outerSpan !== null) {
            const {text, spanClosed} = addPhraseToStack(outerSpan,phrase,space)
            output += text
            if(spanClosed) {
                outerSpan = null
            }
        } else {
            if (phrase.direction === parentDirection || phrase.direction === null) {
                output += (space ? ' ' : '') + phrase.text
            } else {
                outerSpan = new OpenStack(phrase.direction)
                output += `${space ? ' ' : ''}<span dir="${phrase.direction}">${phrase.text}`
            }
        }
        space = true
    }

    return {
        text: output,
        direction: parentDirection,
        spanStack: outerSpan,
        space: space || output.length > 0
    }
}