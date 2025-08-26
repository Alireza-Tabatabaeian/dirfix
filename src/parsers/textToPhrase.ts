import {Direction, Phrase, Word} from "../core/types"
import {containsNeutrals, getDirection, isSpace} from "../tools/charUtils"

const emptyText = () => {
    return {
        text: '',
        direction: null as Direction,
        containsNeutral: false,
        multipleWords: false,
        isEmpty: true
    }
}

const textToWords = (text: string, trimSpaces: boolean = false): Word[] => {
    let words: Word[] = []

    let state = {
        word: emptyText(),
        space: false
    }

    for (let i = 0; i < text.length; i++) {
        const char = text[i]
        const dir = getDirection(char)

        if (isSpace(char)) { // first space will be treated as word separator while leading ones will be added to text
            if (state.space) {
                state.word.text += trimSpaces ? '' : char
            } else {
                state.space = true
                if (!state.word.isEmpty) { //
                    words.push({
                        text: state.word.text,
                        direction: state.word.direction,
                        containsNeutral: state.word.containsNeutral
                    })
                    state.word = emptyText()
                }
            }
        } else {
            state.space = false
            state.word.text += char
            if (state.word.direction === null) { // the word will have same direction as its first directional character
                state.word.direction = dir
            }
            if (containsNeutrals(char)) {
                state.word.containsNeutral = true
            }
            state.word.isEmpty = false
        }
    }

    if (!state.word.isEmpty) {
        words.push(
            {
                text: state.word.text,
                direction: state.word.direction,
                containsNeutral: state.word.containsNeutral
            }
        )
    }

    return words
}

/**
 * CAUTION: the input text should be trimmed and decoded (no entities like &amp; should be contained)
 *
 * a phrase can be considered as a group of words with the same direction.
 * direction neutral words which are surrounded by two phrase with same strong direction words also should be added to group.
 *
 * so a word or a phrase have only one direction
 *
 * because neutrals get merged when surrounded, a neutral phrase can occur in 3 states:
 * 1. at the beginning of the text.
 * 2. direction change like "ltr - neutral - rtl" or "rtl - neutral - ltr"
 * 3. at the end of the text.
 *
 * also between each two "ltr" phrases there has to be one and only one "rtl" phrase and vice versa.
 *
 * the following orders are impossible:
 * following phrases with same direction like "...-ltr-ltr-...", "...-rtl-rtl-...", "...-neutrals-neutrals-..."
 * none or more than one "rtl" phrases between two "ltr" phrases and vice versa.
 *
 */
export const textToPhrase = (text: string, trimSpaces: boolean = false): Phrase[] => {

    let words = textToWords(text, trimSpaces)

    let phrases: Phrase[] = []

    let currentPhrase = emptyText()
    let currentNeutrals = emptyText()

    let currentDirection: Direction | undefined = undefined

    for (const word of words) {
        if (word.direction === null) {
            currentNeutrals = {
                text: currentNeutrals.text + (currentNeutrals.isEmpty ? '' : ' ') + word.text,
                direction: null,
                containsNeutral: currentNeutrals.containsNeutral || word.containsNeutral,
                multipleWords: !currentNeutrals.isEmpty,
                isEmpty: false
            }
            continue
        }

        if (currentDirection === undefined) { // first word with strong direction
            if (!currentNeutrals.isEmpty) {
                phrases.push(currentNeutrals)
                currentNeutrals = emptyText()
            }
            currentDirection = word.direction
            currentPhrase = {...word, multipleWords: false, isEmpty: false}
            continue
        }

        if (currentDirection === word.direction) { // same direction so no need to worry about
            if (currentNeutrals.isEmpty) {
                currentPhrase = {
                    ...currentPhrase,
                    text: currentPhrase.text + ' ' + word.text,
                    containsNeutral: currentPhrase.containsNeutral || word.containsNeutral,
                    multipleWords: true,
                }
            } else {
                currentPhrase = {
                    ...currentPhrase,
                    text: currentPhrase.text + ' ' + currentNeutrals.text + ' ' + word.text,
                    containsNeutral: currentPhrase.containsNeutral || word.containsNeutral || currentNeutrals.containsNeutral,
                    multipleWords: true
                }
                currentNeutrals = emptyText()
            }
            continue
        }

        // if the process has reached here means the direction has changed
        phrases.push(currentPhrase)
        if (!currentNeutrals.isEmpty) {
            phrases.push(currentNeutrals)
            currentNeutrals = emptyText()
        }
        // currentPhrase were pushed before currentNeutrals because currentNeutrals got appended to currentPhrase when new phrase with same direction detected
        // so if currentNeutrals has any items, it means those have appeared after currentPhrase
        currentPhrase = {...word, multipleWords: false, isEmpty: false}
        currentDirection = word.direction
    }

    if (!currentPhrase.isEmpty) { // add remained phrases to the list
        phrases.push(currentPhrase)
    }

    if (!currentNeutrals.isEmpty) { // if a neutral phrase has remained, it should be added to phrases
        phrases.push(currentNeutrals)
    }

    return phrases
}