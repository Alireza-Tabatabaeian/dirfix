const DEFAULT_VOID_TAGS = new Set([
    'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'
])
export const isVoidTag = (el: Element, customVoidTags?: string[]) : boolean => {
    if (customVoidTags && customVoidTags.length) {
        const set = new Set([...DEFAULT_VOID_TAGS, ...customVoidTags.map(t => t.toLowerCase())])
        return set.has(el.tagName.toLowerCase())
    }
    return DEFAULT_VOID_TAGS.has(el.tagName.toLowerCase())
}

export const newAttr = (el: Element, name: string, value: string): Attr => {
    const a = el.ownerDocument?.createAttribute(name) ?? document.createAttribute(name)
    a.value = value
    return a
}

export const attributeToString = (attrs: Attr[]): string => attrs.map(a => `${a.name}="${a.value}"`).join(' ')