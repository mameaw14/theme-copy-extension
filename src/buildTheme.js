import traverse from "./traverse.js"
import Palette from "./utils/Palette.js"

export default async function main() {
  var body = document.body
  const { textColors, bgColors, otherColors } = await traverse(body)
  chrome.storage.sync.set({ textColors, bgColors, otherColors }, function() {
    console.log("SET")
  })
}
main()
