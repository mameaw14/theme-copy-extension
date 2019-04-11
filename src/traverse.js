async function traverse(node) {
  var textColor = {}

  const traverse1 = async node => {
    if (node.nodeType === 1) {
      // element
      try {
        // get color
        let style = window.getComputedStyle(node)
        let color = style.getPropertyValue("color")
        if (!(color in textColor)) {
          textColor[color] = 1
        } else {
          textColor[color]++
        }
      } catch {
        pass
      }
    }

    node.childNodes.forEach(child => {
      traverse(child)
    })
    return true
  }

  await traverse1(body)
  return {
    textColor
  }
}
