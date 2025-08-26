import {Component, Direction, Phrase} from "./types"

export class ParsedComponent {
    type: Component

    startDir: Direction = null
    endDir: Direction = null

    containsNeutrals: boolean = false
    multipleWords: boolean = false

    children: Array<ParsedComponent | Phrase> = []

    ltrCount: number = 0
    rtlCount: number = 0

    element: Element | null

    constructor(type: Component, element: Element | null = null) {
        this.type = type
        this.element = element
    }

    direction = (): Direction => {
        return (
            this.startDir === this.endDir ? this.startDir : null
        )
    }

    preferredDirection = (): Direction => {
        return (
            this.direction() !== null ? this.direction() :
                this.ltrCount === this.rtlCount ? null :
                    this.rtlCount > this.ltrCount ? "rtl" : "ltr"
        )
    }
}