// https://developer.mozilla.org/en-US/docs/Web/HTML/Applying_color
export const BORDER_PROPERTIES = [
  "border-left-color",
  "border-right-color",
  "border-top-color",
  "border-bottom-color"
]
async function traverse(node1) {
  console.log("traverse")
  var textColors = {}
  var bgColors = {}
  var otherColors = {}
  const traverse1 = async node => {
    if (node.nodeType === 1) {
      // element
      try {
        // get color
        let style = window.getComputedStyle(node)
        let color = style.getPropertyValue("color")
        let bgColor = style.getPropertyValue("background-color")
        let outline = style.getPropertyValue("outline-style")
        let border = style.getPropertyValue("border-style")
        if (!(border === "none")) {
          for (let p of BORDER_PROPERTIES) {
            let value = style.getPropertyValue(p)
            if (value in otherColors) {
              otherColors[value]++
            } else {
              otherColors[value] = 1
            }
          }
        }
        let width = node.offsetWidth
        let height = node.offsetHeight
        let area = width * height
        if (isNaN(area)) area = 0

        if (color in textColors) {
          textColors[color]++
        } else {
          textColors[color] = 1
        }
        if (bgColor in bgColors) {
          bgColors[bgColor] += area
        } else {
          bgColors[bgColor] = area
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

  let texts = Object.entries(textColors)
  let bgs = Object.entries(bgColors)
  let others = Object.entries(otherColors)
  texts.sort((a, b) => b[1] - a[1])
  bgs.sort((a, b) => b[1] - a[1])
  others.sort((a, b) => b[1] - a[1])
  const totalText = Object.keys(textColors).length * 100
  const totalBg = Object.keys(bgColors).length * 100
  const totalOther = Object.keys(otherColors).length * 100
  var sumText = 0
  var sumBg = 0
  var sumOther = 0
  for (let a in textColors) {
    sumText += textColors[a]
  }
  for (let a in bgColors) {
    sumBg += bgColors[a]
  }
  for (let a in otherColors) {
    sumOther += otherColors[a]
  }
  const multiplier = {
    text: (1 / sumText) * totalText,
    bg: (1 / sumBg) * totalBg,
    other: (1 / sumOther) * totalOther
  }
  for (let a in textColors) {
    textColors[a] *= multiplier.text
    // multiplier.text /= 2
  }
  for (let a in bgColors) {
    bgColors[a] *= multiplier.bg
    // multiplier.bg /= 2
  }
  for (let a in otherColors) {
    otherColors[a] *= multiplier.other
    // multiplier.other /= 2
  }
  // hack
  textColors[Object.keys(textColors)[0]] += 10000
  bgColors[Object.keys(bgColors)[0]] += 10000
  otherColors[Object.keys(otherColors)[0]] += 10000
  return {
    textColors,
    bgColors,
    otherColors
  }
}

export default traverse
