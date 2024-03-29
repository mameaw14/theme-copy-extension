import munkres from "munkres-js"
import * as colordiff from "color-diff"

function distance(a, b) {
  return (a.weight - b.weight) ** 2
}

function mixDistance(a, b) {
  const labDist = colordiff.diff(a.lab, b.lab) ** 2
  const wDist = (a.weight - b.weight) ** 2
  return Math.sqrt(0.05 * labDist, wDist)
}

function createMatrix(row, col, distance) {
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

async function mappingPalette(source, target, useColorCompare = false) {
  const targetColors = target.colors
  const sourceColors = source.colors
  const _distance = useColorCompare ? mixDistance : distance
  const matrix = createMatrix(sourceColors, targetColors, _distance)
  const munkresResult = munkres(matrix)
  let mapping = {}
  for (let tuple of munkresResult) {
    let sid = tuple[0]
    let tid = tuple[1]

    mapping[sourceColors[sid].original] = targetColors[tid].toRgbString()
  }
  return mapping
}
export default mappingPalette
