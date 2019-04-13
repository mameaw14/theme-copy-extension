import munkres from "munkres-js"
import colordiff from "color-diff"

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
function mappingPalette(target, source) {
  console.log('target,source',target, source)
  const targetColors = target.colors
  const sourceColors = source.colors
  console.log('targetColors, sourceColors', targetColors, sourceColors)
  const matrix = createMatrix(sourceColors, targetColors)
  const munkresResult = munkres(matrix)
  console.log('munkresResult', munkresResult)
  let mapping = {}
  for (let tuple of munkresResult) {
    let sid = tuple[0]
    let tid = tuple[1]
    mapping[sourceColors[sid].original] = targetColors[tid].original
  }
  console.log("mapping", mapping)
  return mapping
}
export default mappingPalette