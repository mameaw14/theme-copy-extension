import traverse from "./traverse.js"
import Palette from "./utils/Palette.js"

export default async function main() {
  var body = document.body
  const { textColors, bgColors } = await traverse(body)
  chrome.storage.sync.set({ textColors, bgColors }, function() {
    console.log("SET textColors")
    console.log("SET bgColors")
  })
}
main()
