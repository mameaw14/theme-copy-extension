export async function loadText(url) {
  return await (await fetch(url)).text()
}

export async function getRules(sheet) {
  try {
    if (sheet.cssRules != null) {
      return sheet.cssRules
    }
  } catch (err) {
    console.error(err)
  }
  let cssText = await loadText(sheet.href)

  const cors = document.createElement("style")
  cors.media = "screen"
  cors.textContent = cssText
  sheet.ownerNode.parentNode.insertBefore(cors, sheet.ownerNode.nextSibling)
  sheet.disabled = true
  cors.sheet.disabled = false
  // console.log('cors',cors)
  return cors.sheet.cssRules
}
