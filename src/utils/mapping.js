import munkres from "munkres-js"
import colordiff from "color-diff"

function distance(a, b) {
  const labDist = colordiff.diff(a.lab, b.lab) ** 2
  const wDist = (a.weight - b.weight) ** 2
  return Math.sqrt(0.5 * labDist + wDist)
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
function mappingPalette(source, target) {
  const targetColors = target.colors
  const sourceColors = source.colors
  const matrix = createMatrix(sourceColors, targetColors)
  const munkresResult = munkres(matrix)
  let mapping = {}
  for (let tuple of munkresResult) {
    let sid = tuple[0]
    let tid = tuple[1]
    mapping[sourceColors[sid].original] = targetColors[tid].original
  }
  return mapping
}
export default mappingPalette
