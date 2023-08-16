import * as dom from '../dom.js'

window.html = (result) => result[0]

window.applyStyles = (element, styles) => {
    const descendants = dom.getAllDescendants(element)
    const selectors = dom.getDescendantsSelectors(descendants)
    selectors.uniqueTags.forEach((element) => {
        if (styles.tag[element]) {
            for (const [key, value] of Object.entries(styles.tag[element])) {
                document.querySelectorAll(element).forEach((e) => {
                  e.style.setProperty(key, value)  
                })
            }
        }
    })
    selectors.uniqueClasses.forEach((element) => {
        if (styles.class[element]) {
            for (const [key, value] of Object.entries(styles.class[element])) {
                document.querySelectorAll('.' + element).forEach((e) => {
                    e.style.setProperty(key, value)  
                })
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
window.insertElement = (parentElement, element, styles) => {
    parentElement.insertAdjacentHTML('beforeend', element)
    const createdElement = parentElement.children[parentElement.children.length-1]
    applyStyles(createdElement, styles)
    dom.createDomVariables()
}
window.showInsteadOf = (toShowElement, toHideElement, value) => {
    toShowElement.style.display = value || 'grid'
    toHideElement.style.display = 'none'
}
window.addEventListener("selectstart", function(event) {
    event.preventDefault();
});
Array.prototype.lastElement = function() {
    return this[this.length-1]
}