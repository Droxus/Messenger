import * as dom from '../dom.js'

window.html = (result) => result[0]

window.applyStyles = (element, styles) => {
    const descendants = dom.getAllDescendants(element.parentElement)
    const selectors = dom.getDescendantsSelectors(descendants)
    console.log(selectors)
    selectors.uniqueTags.forEach((element) => {
        if (styles.tag[element]) {
            for (const [key, value] of Object.entries(styles.tag[element])) {
                document.querySelector(element).style.setProperty(key, value)
            }
        }
    })
    selectors.uniqueClasses.forEach((element) => {
        if (styles.class[element]) {
            for (const [key, value] of Object.entries(styles.class[element])) {
                document.querySelector('.' + element).style.setProperty(key, value)
            }
        }
    })
    selectors.uniqueIds.forEach((element) => {
        if (styles.id[element]) {
            for (const [key, value] of Object.entries(styles.id[element])) {
                document.querySelector('#' + element).style.setProperty(key, value)
            }
        }
    })
}
window.insetElement = (parentElement, element, styles) => {
    parentElement.insertAdjacentHTML('beforeend', element)
    const createdElement = parentElement.children[parentElement.children.length-1]
    applyStyles(createdElement, styles)
    dom.createDomVariables()
}