async function traverse(node1) {
  var textColors = {}
  var bgColors = {}

  const traverse1 = async node => {
    if (node.nodeType === 1) {
      // element
      try {
        // get color
        let style = window.getComputedStyle(node)
        let color = style.getPropertyValue("color")
        let bgColor = style.getPropertyValue("background-color")
        let width = node.offsetWidth
        let height = node.offsetHeight
        let area = width * height
        if (isNaN(area)) area = 0

        if (!(color in textColors)) {
          textColors[color] = 1
        } else {
          textColors[color]++
        }
        if (!(bgColor in bgColors)) {
          bgColors[bgColor] = area
        } else {
          bgColors[bgColor] += area
        }
      } catch (error) {
        console.error(error)
      }
    }

    node.childNodes.forEach(child => {
      traverse1(child)
    })
    return true
  }

  await traverse1(node1)
  delete bgColors['rgba(0, 0, 0, 0)']
  return {
    textColors,
    bgColors
  }
}

async function main() {
  var body = document.body
  const { textColors, bgColors } = await traverse(body)

  var sortedTextColors = []
  var sortedBgColors = []
  for (let i in textColors) {
    sortedTextColors.push([i, textColors[i]])
  }
  sortedTextColors.sort((a, b) => b[1] - a[1])
  for (let i in bgColors) {
    sortedBgColors.push([i, bgColors[i]])
  }
  sortedBgColors.sort((a, b) => b[1] - a[1])

  chrome.storage.sync.set(
    { textColors: sortedTextColors, bgColors: sortedBgColors },
    function() {
      console.log("set", sortedTextColors)
      console.log("set", sortedBgColors)
    }
  )
}
main()
