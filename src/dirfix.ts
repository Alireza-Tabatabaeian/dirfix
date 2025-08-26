import {decodeHtmlEntities} from "./tools/textUtils"
import {Direction, DirFixOptions, Rendered} from "./core/types"
import {ParsedComponent} from "./core/ParsedComponent"
import {nodeParser} from "./parsers/nodeParser"
import {ComponentRenderer} from "./renderers/ComponentRenderer"
import {defaultDomFactory, DOMHandler} from "./core/DOMHandler"

/**
 *
 * @param inputHtmlString
 * @param defaultDir // this must be the direction of the container (div, body, ...) where the content will shown there. default to 'ltr'
 * @param options
 *
 * DirFixOptions : {
 *     decodeOptions : {
 *         normalizeSpaces: bool, // default is false, so Non-Breakable Spaces will be decoded as regular spaces. Better to leave it as false.
 *         decodeTwice: bool, // default is true, so `&amp;nbsp; → &nbsp; → space`. It's highly recommended to keep it true.
 *         customEntities: HTMLSymbol[] // any HTMLSymbol that exist in content but not listed as defaults (check textUtils.ts line 20 for default list)
 *     },
 *     parseOptions: {
 *         customVoidTags: string[] // any void tags that I have forgotten to add
 *         trimSpaces: boolean // if set to false, it will save the leading spaces between text parts else those spaces will be trim out. default to false.
 *         defaultDomFactory: DomFactory // a function that takes a html string as input and return the body part as HTML Element. default to defaultDomFactory
 *         customWrapQuery: string // acts as a key to fetch the innerHTML part of the rendered html. Defaults to DOMHandler.WRAP_QUERY
 *     },
 *     fileMode: boolean // true if the input is the string fetched from a file (which might contains head part)
 * }
 */
export const dirFix = (
    inputHtmlString: string,
    defaultDir: Direction = 'ltr',
    options: Partial<DirFixOptions> = {},
): string => {

    const decodeOptions = options.decodeOptions ?? {}
    const parseOptions = options.parseOptions ?? {}
    const fileMode = options.fileMode ?? false

    const {customDomFactory = defaultDomFactory, customWrapQuery = DOMHandler.WRAP_QUERY} = parseOptions

    // first step is to decode the inputHtml so entities like `&amp;` won't be treated as regular text
    const decodedHTML: string = decodeHtmlEntities(inputHtmlString, decodeOptions)

    const domParser = new DOMHandler(customDomFactory, customWrapQuery)

    // now the decoded string needs to be parsed as a tree
    const rootComponent: HTMLElement = domParser.stringToNode(decodedHTML, fileMode)

    // parse the tree
    const parsedRootComponent: ParsedComponent = nodeParser(rootComponent, domParser.nodeFactory, parseOptions)

    // render the parsed tree
    const rendered: Rendered = ComponentRenderer(parsedRootComponent, null, defaultDir, false)

    // remove the div which were added to group the incoming childNodes
    return domParser.extractFinalHTML(rendered, rendered.direction !== defaultDir ? rendered.direction : null, customWrapQuery)
}