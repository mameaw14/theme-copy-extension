async function traverse(node1) {
  console.log('traverse')
  var textColors = {}
  var bgColors = {}
  const traverse1 = async node => {
    if (node.nodeType === 1) {
      // element
      try {
        // get color
        let style = window.getComputedStyle(node)
        let color = style.getPropertyValue("color")
        let bgColor = style.getPropertyValue("background-color")
        let width = node.offsetWidth
        let height = node.offsetHeight
        let area = width * height
        if (isNaN(area)) area = 0

        if (!(color in textColors)) {
          textColors[color] = 1
        } else {
          textColors[color]++
        }
        if (!(bgColor in bgColors)) {
          bgColors[bgColor] = area
        } else {
          bgColors[bgColor] += area
        }
      } catch (error) {
        console.error(error)
      }
    }

    node.childNodes.forEach(child => {
      traverse1(child)
    })
    return true
  }

  await traverse1(node1)
  delete bgColors["rgba(0, 0, 0, 0)"]
  var sumText = 0
  var sumBg = 0
  for (let a in textColors) {
    sumText += textColors[a]
  }
  for (let a in bgColors) {
    sumBg += bgColors[a]
  }
  for (let a in textColors) {
    textColors[a] /= sumText
  }
  for (let a in bgColors) {
    bgColors[a] /= sumBg
  }
  return {
    textColors,
    bgColors
  }
}

export default traverse
