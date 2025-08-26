import {Phrase, ParsingResult} from "../core/types";
import {textToPhrase} from "./textToPhrase";

// this method takes the actual text part of a html element and returns an object containing the required information for rendering.
export const textParser = (inputText: string, trimSpaces: boolean=false): ParsingResult => {
    const parsedPhrases: Phrase[] = textToPhrase(inputText, trimSpaces)
    let ltr: number = 0
    let rtl: number = 0
    let containsNeutral: boolean = false
    let multiWords: boolean = false

    for (const phrase of parsedPhrases) {
        containsNeutral = containsNeutral || phrase.containsNeutral
        multiWords = multiWords || phrase.multipleWords

        if (phrase.direction !== null) {
            phrase.direction === "ltr" ? ltr++ : rtl++
        }
    }

    return {
        children: parsedPhrases,
        context: {ltr, rtl},
        containsNeutral,
        multipleWords: multiWords || parsedPhrases.length > 1,
    }
}