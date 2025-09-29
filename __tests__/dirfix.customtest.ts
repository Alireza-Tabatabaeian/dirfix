import {dirFix} from "../src";
import {TEST_INPUT_HTML} from "./testData";
import * as jsdom from 'jsdom'

const {JSDOM} = jsdom
const dom = new JSDOM(`something raw`)
console.log(dom.window.document.body as HTMLElement)

console.log(dirFix(TEST_INPUT_HTML))