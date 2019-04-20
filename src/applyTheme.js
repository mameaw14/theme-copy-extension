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
        node.setAttribute("bggetted", nearlestBgColor)
      }
    } catch (error) {
      console.log(error)
    }
  }

  node.childNodes.forEach(child => {
    adjustTextContrast(child, mapping, nearlestBgColor, n + 1)
  })
  return true
}

async function main() {
  let properties = ["text", "bg", "other"]
  const { textColors, bgColors, otherColors } = await traverse(document.body)
  const s = { text: textColors, bg: bgColors, other: otherColors }
  var mapping = { text: {}, bg: {}, other: {} }

  chrome.storage.sync.get(
    ["textColors", "bgColors", "otherColors"],
    async function(data) {
      const t = {
        text: data.textColors,
        bg: data.bgColors,
        other: data.otherColors
      }

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
        if (s.length < t.length) {
          const k = s.length
          const newColors = await t.getNColors(k)
          t = new Palette(newColors)
          mapping[p] = await mappingPalette(s, t)
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
              let newLuminance =
                targetColor.lab.L + (sourceColor.lab.L - color.lab.L)
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
          mapping[p] = _mapping
        } else {
          mapping[p] = await mappingPalette(s, t)
        }
      }
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
