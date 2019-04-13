import munkres from "munkres-js"
import colordiff from "color-diff"
import traverse from "./traverse.js"
import Palette from "./utils/Palette.js"

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
    results.push({ lab, w: weight, original: color })
  }
  return results
}

function distance(a, b) {
  const labDist = colordiff.diff(a.lab, b.lab) ** 2
  const wDist = (a.w - b.w) ** 2
  return Math.sqrt(labDist + wDist)
}

function createMatrix(row, col) {
  let matrix = []
  for (let m of row) {
    let row = []
    for (let n of col) {
      row.push(distance(m, n))
    }
    matrix.push(row)
  }
  return matrix
}
function createMap(target, source) {
  // console.log('target,source',target, source)
  const targetLabPalette = convertRgbToLabPreserveWeight(target)
  const sourceLabPalette = convertRgbToLabPreserveWeight(source)
  const matrix = createMatrix(sourceLabPalette, targetLabPalette)
  const munkresResult = munkres(matrix)
  // console.log('munkresResult', munkresResult)
  let mapping = {}
  for (let tuple of munkresResult) {
    let sid = tuple[0]
    let tid = tuple[1]
    mapping[sourceLabPalette[sid].original] = targetLabPalette[tid].original
  }
  console.log("mapping", mapping)
  return mapping
}
async function main() {
  var body = document.body
  let properties = ["text", "bg"]
  const { textColors, bgColors } = await traverse(body)
  const s = { text: textColors, bg: bgColors }
  var mapping = { text: {}, bg: {} }

  chrome.storage.sync.get(["textColors", "bgColors"], function(data) {
    const t = { text: data.textColors, bg: data.bgColors }

    // t: copied, s: to paste
    const palettes = {}
    for (let p of properties) {
      palettes[p] = {
        s: new Palette(s[p]),
        t: new Palette(t[p])
      }
    }
    for (let p in palettes) {
      const { t, s } = palettes[p]
      if (s.length < t.length) {
        const k = s.length
        const kmeansResult = t.clustering(k)
        console.log('kmean result')
      }
    }
    // mapping.text = createMap(srcTextColors, textColors)
    // mapping.bg = createMap(srcBgColors, bgColors)

    // replace(body, mapping)
  })
}
main()
