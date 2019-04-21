import { log } from "./utils/logMessage"

// https://developer.mozilla.org/en-US/docs/Web/HTML/Applying_color
export const BORDER_PROPERTIES = [
  "border-left-color",
  "border-right-color",
  "border-top-color",
  "border-bottom-color"
]
const PROPERTIES = ["text", "bg", "other"]
async function traverse(node1) {
  log("TRAVERSE")
  let colors = { text: {}, bg: {}, other: {} }
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
            if (value in colors.other) {
              colors.other[value]++
            } else {
              colors.other[value] = 1
            }
          }
        }
        let width = node.offsetWidth
        let height = node.offsetHeight
        let area = width * height
        if (isNaN(area)) area = 0

        if (color in colors.text) {
          colors.text[color]++
        } else {
          colors.text[color] = 1
        }
        if (bgColor in colors.bg) {
          colors.bg[bgColor] += area
        } else {
          colors.bg[bgColor] = area
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
  delete colors.bg["rgba(0, 0, 0, 0)"]

  const total = {
    text: Object.keys(colors.text).length * 100,
    bg: Object.keys(colors.bg).length * 100,
    other: Object.keys(colors.other).length * 100
  }
  let sum = {}
  for (let p of PROPERTIES) {
    sum[p] = Object.values(colors[p]).reduce((a, b) => a + b)
    for (let key in colors[p]) {
      colors[p][key] *= total[p] / sum[p]
    }
  }
  const C = 10000
  let entries = {}
  for (let p of PROPERTIES) {
    entries[p] = Object.entries(colors[p]).sort((a, b) => b[1] - a[1])
  }

  const textTenPercent = 0.04 * total.text
  for (
    let i = 0;
    i < entries.text.length && colors.text[entries.text[i][0]] > textTenPercent;
    i++
  ) {
    colors.text[entries.text[i][0]] += C / 2 ** i
  }

  const bgTenPercent = 0.07 * total.bg
  for (
    let i = 0;
    i < entries.bg.length && colors.bg[entries.bg[i][0]] > bgTenPercent;
    i++
  ) {
    colors.bg[entries.bg[i][0]] += C / 2 ** i
  }
  log("Traverse Result:", colors)
  return {
    bgColors: colors.bg,
    textColors: colors.text,
    otherColors: colors.other
  }
}

export default traverse
