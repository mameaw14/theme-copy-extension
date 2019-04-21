import traverse from "./traverse.js"
import Palette from "./utils/Palette.js"
import { log } from "./utils/logMessage.js"

async function main() {
  var body = document.body
  const { textColors, bgColors, otherColors } = await traverse(body)
  chrome.storage.sync.set({ textColors, bgColors, otherColors }, function() {
    log(`Build theme at ${window.location.href}`)
  })
}
main()
