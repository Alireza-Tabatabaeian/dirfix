import {Direction, Phrase, StackAddResult} from "./types"

export class OpenStack {
    direction: Direction
    oppositeDirection: Direction
    waitingList: Phrase[] = []
    containsOpposite: boolean = false
    voidCount = 0

    constructor(direction: Direction) {
        this.direction = direction
        this.oppositeDirection = direction === 'ltr' ? 'rtl' : 'ltr'
    }

    addToWaiting(item: Phrase, isVoid: boolean = false) {
        if (item.direction !== null)
            this.containsOpposite = true
        this.waitingList.push(item)
        if(isVoid)
            this.voidCount++
    }

    spanShouldExpanded(phrase: Phrase): boolean {
        return phrase.direction === this.direction
    }

    spanShouldClosed(phrase: Phrase): boolean { // a voidTage like br shouldn't force span to close.
        return (phrase.direction === this.oppositeDirection && (phrase.multipleWords || (this.waitingList.length - this.voidCount > 0)))
            || (phrase.direction === null && phrase.containsNeutral && this.containsOpposite)
    }

    getWaitingString(): string {
        return this.waitingList.map(phrase => phrase.text).join('')
    }

    expandSpan(phrase: Phrase, space: string): string {
        let output = this.getWaitingString() + space + phrase.text
        this.waitingList = []
        this.containsOpposite = false
        this.voidCount = 0
        return output
    }
}

export function addPhraseToStack(stack: OpenStack, phrase: Phrase, space: boolean): StackAddResult {
    const prependSpace = space ? ' ' : ''
    if (stack.spanShouldClosed(phrase)) {
        return {
            text: '</span>' + stack.getWaitingString() + prependSpace + phrase.text,
            spanClosed: true
        }
    }
    if (stack.spanShouldExpanded(phrase)) {
        const text = stack.expandSpan(phrase, prependSpace)
        return {
            text, spanClosed: false
        }
    }
    const isVoid = !phrase.containsNeutral && phrase.direction === null
    stack.addToWaiting(
        {
            ...phrase,
            text: prependSpace + phrase.text
        }, isVoid
    )
    return {
        text: '', spanClosed: false
    }
}