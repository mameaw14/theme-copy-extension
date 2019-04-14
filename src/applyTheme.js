import munkres from "munkres-js"
import colordiff from "color-diff"
import traverse from "./traverse.js"
import Palette from "./utils/Palette.js"
import mappingPalette from "./utils/mapping.js";

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
        const newColor = await t.getNColors(k)
        t = new Palette(newColor)
      }
      mapping[p] = mappingPalette(t, s)
    }
    replace(body, mapping)
  })
}
main()
