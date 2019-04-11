import munkres from "munkres-js"
import colordiff from "color-diff"
import traverse from "./traverse.js"

var replace = async (node, mapping) => {
  if (node.nodeType === 1) {
    // element
    try {
      let style = window.getComputedStyle(node)
      let color = style.getPropertyValue("color")
      let bgColor = style.getPropertyValue("background-color")

      if (color in mapping.text) {
        node.style.color = mapping.text[color]
      }
      if (bgColor in mapping.bg) {
        node.style.backgroundColor = mapping.bg[bgColor]
      }
    } catch (error) {
      console.log(error)
    }
  }

  node.childNodes.forEach(child => {
    replace(child, mapping)
  })
  return true
}

const convertRgbToLabPreserveWeight = palette => {
  let results = []
  for (let key in palette) {
    const color = key
    const weight = palette[key]
    let rgb = color.replace(/[^\d,]/g, "").split(",")
    let isRgba = rgb.length === 4
    let lab
    if (isRgba) {
      let rgbaObj = { R: rgb[0], G: rgb[1], B: rgb[2], A: rgb[3] }
      lab = colordiff.rgba_to_lab(rgbaObj)
    } else {
      let rgbObj = { R: rgb[0], G: rgb[1], B: rgb[2] }
      lab = colordiff.rgb_to_lab(rgbObj)
    }
    results.push({lab, w: weight})
  }
  return results
}

function distance(a, b) {
  const labDist = colordiff.diff(a.lab, b.lab) ** 2
  const wDist = (a.w - b.w) ** 2
  return Math.sqrt(labDist + wDist)
}

function createMatrix(target, source) {
  let matrix = []
  for (let m of target) {
    let row = []
    for (let n of source) {
      row.push(distance(m, n))
    }
    matrix.push(row)
  }
  return matrix
}
function createMap(target, source) {
  const targetLabPalette = convertRgbToLabPreserveWeight(target)
  const sourceLabPalette = convertRgbToLabPreserveWeight(source)
  const matrix = createMatrix(targetLabPalette, sourceLabPalette)
  const munkresResult = munkres(matrix)
}
async function main() {
  var body = document.body
  const { textColors, bgColors } = await traverse(body)

  var mapping = { text: {}, bg: {} }
  var srcTextColors, srcBgColors
  chrome.storage.sync.get(["textColors", "bgColors"], function(data) {
    srcTextColors = data.textColors
    srcBgColors = data.bgColors
    
    // mapping.text = createMap(srcTextColors, textColors)
    // mapping.bg = createMap(srcBgColors, bgColors)
    createMap(srcTextColors, textColors)
    createMap(srcBgColors, bgColors)

    // replace(body, mapping)
  })
}
main()
