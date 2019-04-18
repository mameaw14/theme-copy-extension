import munkres from "munkres-js"
import colordiff from "color-diff"
import traverse from "./traverse.js"
import Palette from "./utils/Palette.js"
import mappingPalette from "./utils/mapping.js"
import Color from "./utils/Color.js"

function addCssText(node, property, value) {
  node.style.cssText += `;${property}: ${value} !important`
}
async function replace(node, mapping, nearlestBgColor = "white") {
  if (node.nodeType === 1) {
    // element
    try {
      let style = window.getComputedStyle(node)
      let color = style.getPropertyValue("color")
      let bgColor = style.getPropertyValue("background-color")

      if (bgColor in mapping.bg) {
        addCssText(node, "background-color", mapping.bg[bgColor])
        nearlestBgColor = mapping.bg[bgColor]
      }

      let fg =
        color in mapping.text
          ? new Color(mapping.text[color])
          : new Color(color)

      const bg = new Color(nearlestBgColor)
      if (!Color.isContrastOK(fg, bg)) {
        addCssText(
          node,
          "color",
          Color.getCompatibleTextColor(fg, bg).toRgbString()
        )
      } else {
        addCssText(node, "color", mapping.text[color])
      }
    } catch (error) {
      console.log(error)
    }
  }

  node.childNodes.forEach(child => {
    replace(child, mapping, nearlestBgColor)
  })
  return true
}

async function main() {
  var body = document.body
  let properties = ["text", "bg"]
  const { textColors, bgColors } = await traverse(body)
  const s = { text: textColors, bg: bgColors }
  var mapping = { text: {}, bg: {} }

  chrome.storage.sync.get(["textColors", "bgColors"], async function(data) {
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
      let { t, s } = palettes[p]
      if (s.length < t.length) {
        const k = s.length
        const newColors = await t.getNColors(k)
        t = new Palette(newColors)
        mapping[p] = mappingPalette(s, t)
      } else if (s.length > t.length) {
        const k = t.length
        const {
          clusters,
          results: newColors
        } = await s.getNColorsAndClusteringResults(k)
        const sPrime = new Palette(newColors)
        const _mapping = mappingPalette(sPrime, t)
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
        mapping[p] = mappingPalette(s, t)
      }
      console.log("MAP", p, mapping[p])
    }
    replace(body, mapping)
    console.log("REPLACED")
  })
}
main()
