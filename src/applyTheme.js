import munkres from "munkres-js"
import colordiff from "color-diff"
import traverse from "./traverse.js"
import Palette from "./utils/Palette.js"
import mappingPalette from "./utils/mapping.js"
import Color from "./utils/Color.js"
import { loadText, getRules } from "./utils/stylesheet.js"
const BORDER_PROPERTIES = [
  "borderLeftColor",
  "borderRightColor",
  "borderTopColor",
  "borderBottomColor"
]
function addCssText(node, property, value) {
  node.style.cssText += `;${property}: ${value} !important`
}
async function replaceRules(mapping) {
  const styleSheets = Object.values(document.styleSheets)
  for (let i = 0; i < styleSheets.length; i++) {
    try {
      const sheet = styleSheets[i]
      const rules = await getRules(sheet)
      // console.log("RULES", i)
      // console.log("LENGTH", styleSheets.length)
      for (let rule of rules) {
        if (!("style" in rule)) continue
        let color = rule.style.color
        let bgColor = rule.style.backgroundColor
        let border = rule.style.borderStyle !== "none"
        if (bgColor in mapping.bg) {
          rule.style.backgroundColor = mapping.bg[bgColor]
        }
        if (color in mapping.text) {
          rule.style.color = mapping.text[color]
        }
        if (border) {
          for (let p of BORDER_PROPERTIES) {
            const value = rule.style[p]
            if (value in mapping.bg) {
              rule.style[p] = mapping.bg[value]
            } else if (value in mapping.other) {
              rule.style[p] = mapping.other[value]
            }
          }
        }
      }
    } catch (err) {
      console.error(err)
      continue
    }
  }
  return
}
async function adjustTextContrast(
  node,
  mapping,
  nearlestBgColor = "white",
  n = 1
) {
  if (n === 20) return false
  if (node.nodeType === 1) {
    // element
    // console.log(node)
    try {
      let style = window.getComputedStyle(node)
      let color = style.getPropertyValue("color")
      let bgColor = style.getPropertyValue("background-color")
      if (bgColor !== "rgba(0, 0, 0, 0)") {
        nearlestBgColor = bgColor
      }
      let fg = new Color(color)
      const bg = new Color(nearlestBgColor)
      if (!Color.isContrastOK(fg, bg)) {
        addCssText(
          node,
          "color",
          Color.getCompatibleTextColor(fg, bg).toRgbString()
        )
      }
      node.setAttribute("bggetted", nearlestBgColor)
    } catch (error) {
      console.log(error)
    }
  }

  node.childNodes.forEach(child => {
    adjustTextContrast(child, mapping, nearlestBgColor, n + 1)
  })
  return true
}
function getRepresentColor2(palette, clustered) {
  const results = {}
  for (let i = 0; i < clustered.length; i++) {
    const cluster = clustered[i]
    const id = Math.min(...cluster.clusterInd)
    const key = palette.colors[id].original
    results[key] = i
  }
  return results
}
function getRepresentColor(clustered) {
  const results = {}
  for (let i = 0; i < clustered.length; i++) {
    const cluster = clustered[i]
    results[cluster.centroid.original] = i
  }
  return results
}

function getPaletteOfRepresentColor(palette, clustered) {
  const { colors } = palette
  const results = {}
  for (let i = 0; i < clustered.length; i++) {
    const cluster = clustered[i]
    results[cluster.centroid.original] = cluster.cluster.reduce(
      (a, b) => a + b.weight,
      0
    )
  }
  return new Palette(results)
}
async function MapPaletteWithoutFill(s, t) {
  let results = []
  let mapping
  if (s.length < t.length) {
    const k = s.length
    const {
      results: newColors,
      clusters
    } = await t.getNColorsAndClusteringResults(k)
    const representColor = getRepresentColor2(t, clusters)
    // console.log(clusters)
    const tPrime = new Palette(newColors)
    mapping = await mappingPalette(s, tPrime)
    for (let key in mapping) {
      results.push([
        [key],
        clusters[representColor[mapping[key]]].clusterInd.map(
          id => t.colors[id].original
        )
      ])
    }
  } else if (s.length > t.length) {
    const k = t.length
    const {
      clusters,
      results: newColors
    } = await s.getNColorsAndClusteringResults(k)
    const representColor = getRepresentColor2(s, clusters)
    const sPrime = new Palette(newColors)
    mapping = await mappingPalette(sPrime, t)

    for (let key in mapping) {
      results.push([
        clusters[representColor[key]].clusterInd.map(
          id => s.colors[id].original
        ),
        [mapping[key]]
      ])
    }
  } else {
    mapping = await mappingPalette(s, t)
    for (let key in mapping) {
      results.push([[key], [mapping[key]]])
    }
  }
  return results
}
async function fillAndMapPalette(s, t) {
  let mapping
  if (s.length < t.length) {
    const k = s.length
    const newColors = await t.getNColors(k)
    t = new Palette(newColors)
    mapping = await mappingPalette(s, t)
  } else if (s.length > t.length) {
    const k = t.length
    const {
      clusters,
      results: newColors
    } = await s.getNColorsAndClusteringResults(k)
    const sPrime = new Palette(newColors)
    const _mapping = await mappingPalette(sPrime, t)
    for (let cluster of clusters) {
      const representId = cluster.clusterInd[0]
      const sourceColor = s.colors[representId]
      const representKey = sourceColor.original
      const targetColor = new Color(_mapping[representKey])
      for (let i = 1; i < cluster.clusterInd.length; i++) {
        const id = cluster.clusterInd[i]
        const color = s.colors[id]
        let newLuminance = targetColor.lab.L + (sourceColor.lab.L - color.lab.L)
        if (newLuminance < 0) newLuminance = 0
        if (newLuminance > 100) newLuminance = 100
        const newColorString = Color.lab_to_rgbstr({
          L: newLuminance,
          a: targetColor.lab.a,
          b: targetColor.lab.b
        })
        _mapping[color.original] = newColorString
      }
    }
    mapping = _mapping
  } else {
    mapping = await mappingPalette(s, t)
  }
  return mapping
}

async function createMapping(s, t) {
  const properties = Object.keys(s)
  let mapping = {}

  // t: copied, s: to paste
  const palettes = {}
  for (let p of properties) {
    palettes[p] = {
      s: new Palette(s[p]),
      t: new Palette(t[p])
    }
  }
  for (let p in palettes) {
    let { t, s } = palettes[p]
    mapping[p] = {}
    let clustered = {},
      representColor = {}
    clustered.t = await t.clusterByHue() // get clustered color palette
    clustered.t = clustered.t.filter(c => c.ratio > 0.01) // filter noise out
    representColor.t = getRepresentColor(clustered.t) // get represent color with cluster id

    clustered.s = await s.clusterByHue() // get clustered color palette
    representColor.s = getRepresentColor(clustered.s) // get represent color with cluster id

    let srPalette = getPaletteOfRepresentColor(s, clustered.s)
    let trPalette = getPaletteOfRepresentColor(t, clustered.t)
    let matched = await MapPaletteWithoutFill(srPalette, trPalette) // get list of tuple [[sOri,tOri], ...] logic like mappingPalette
    console.log("match", matched, srPalette.length, trPalette.length)
    for (let [sKey, tKey] of matched) {
      let sPalette = Palette.mergePalette(
        sKey.map(key => {
          let id = representColor.s[key]
          return clustered.s[id].palette
        })
      )
      let tPalette = Palette.mergePalette(
        tKey.map(key => {
          let id = representColor.t[key]
          return clustered.t[id].palette
        })
      )
      let _mapping = await fillAndMapPalette(sPalette, tPalette)
      mapping[p] = { ...mapping[p], ..._mapping }
    }
  }

  //   if (s.length < t.length) {
  //     const k = s.length
  //     const newColors = await t.getNColors(k)
  //     t = new Palette(newColors)
  //     mapping[p] = await mappingPalette(s, t)
  //   } else if (s.length > t.length) {
  //     const k = t.length
  //     const {
  //       clusters,
  //       results: newColors
  //     } = await s.getNColorsAndClusteringResults(k)
  //     const sPrime = new Palette(newColors)
  //     const _mapping = await mappingPalette(sPrime, t)
  //     for (let cluster of clusters) {
  //       const representId = cluster.clusterInd[0]
  //       const sourceColor = s.colors[representId]
  //       const representKey = sourceColor.original
  //       const targetColor = new Color(_mapping[representKey])

  //       for (let i = 1; i < cluster.clusterInd.length; i++) {
  //         const id = cluster.clusterInd[i]
  //         const color = s.colors[id]
  //         let newLuminance =
  //           targetColor.lab.L + (sourceColor.lab.L - color.lab.L)
  //         if (newLuminance < 0) newLuminance = 0
  //         if (newLuminance > 100) newLuminance = 100
  //         const newColorString = Color.lab_to_rgbstr({
  //           L: newLuminance,
  //           a: targetColor.lab.a,
  //           b: targetColor.lab.b
  //         })
  //         _mapping[color.original] = newColorString
  //       }
  //     }
  //     mapping[p] = _mapping
  //   } else {
  //     mapping[p] = await mappingPalette(s, t)
  //   }
  // }
  return mapping
}
async function main() {
  const { textColors, bgColors, otherColors } = await traverse(document.body)
  const s = { text: textColors, bg: bgColors, other: otherColors }

  chrome.storage.sync.get(
    ["textColors", "bgColors", "otherColors"],
    async function(data) {
      const t = {
        text: data.textColors,
        bg: data.bgColors,
        other: data.otherColors
      }
      let mapping = await createMapping(s, t)

      console.log("MAPPING", mapping)
      console.log("REPLACE RULE")
      await replaceRules(mapping)
      console.log("END REPLACE RULE")
      await setTimeout(async () => {
        console.log("ADJUST TEXT CONTRAST")
        await adjustTextContrast(
          document.body,
          mapping,
          Object.values(mapping.bg)[0]
        )
        console.log("END ADJUST TEXT CONTRAST")
      }, 1000)
      console.log("APPLIED")
    }
  )
}
main()
