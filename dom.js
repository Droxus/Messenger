export function createDomVariables() {
      const body = document.querySelector('html');
      const allDescendants = getAllDescendants(body);
    //   console.log(allDescendants);
      
      const { uniqueTags, uniqueClasses, uniqueIds } = getDescendantsSelectors(allDescendants)
    //   console.log('Tags:', uniqueTags);
    //   console.log('Classes:', uniqueClasses);
    //   console.log('IDs:', uniqueIds);
      
      uniqueTags.forEach((tag) => {
        window[tag] = Array.from(document.getElementsByTagName(tag))
      })
      
      uniqueClasses.forEach((classEl) => {
        window[classEl] = Array.from(document.getElementsByClassName(classEl))
      })
      
      uniqueIds.forEach((id) => {
        if (id) {
          window[id] = document.getElementById(id)
        }
      })
}
export function getAllDescendants(element) {
  const descendants = [];

  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i];
    descendants.push(child);
    descendants.push(...getAllDescendants(child));
  }

  return descendants;
}
export function getDescendantsSelectors(allDescendants) {
  const uniqueTags = Array.from(new Set(allDescendants.map((element) => String(element.tagName).toLowerCase())));
  const uniqueClasses = Array.from(new Set(allDescendants.flatMap((element) => {
    if (element.classList) {
      return Array.from(element.classList)
    }
  })));
  const uniqueIds = Array.from(new Set(allDescendants.map((element) => {
      if (element.id) {
        return element.id 
      }
  })));
  return {
    uniqueTags: uniqueTags,
    uniqueClasses: uniqueClasses,
    uniqueIds: uniqueIds
  }
}