import Color from "./Color"
import kmeans from "./kmeans"

export default class Palette {
  constructor(colors) {
    this.colors = []
    for (let color in colors) {
      this.colors.push(new Color(color, colors[color]))
    }
    this.colors.sort((a, b) => b.weight - a.weight)
    console.log(`Created a palette with ${this.colors.length} colors`)
  }
  get length() {
    return this.colors.length
  }
  get hueHistogram() {
    if (this._hueHistogram) return this._hueHistogram
    const { colors } = this
    const histogram = new Array(361).fill(0)
    for (let color of colors) {
      let hue = Math.round(color.hue)
      histogram[hue]++
    }
    console.log(`Construct histogram of ${this.colors.length} colors`)
    console.log(histogram)
    this._hueHistogram = histogram
    return this._hueHistogram
  }
  findLocalMinima() {
    const { hueHistogram } = this
    const localMinima = []

    let direction = 0
    for (let i = 2; i < hueHistogram.length; i++) {
      const element = hueHistogram[i]
      const l_element = hueHistogram[i - 1]

      if (element < l_element) {
        direction = 1
      } else if (element > l_element) {
        if (direction === 1) {
          localMinima.push(i - 1)
        }
        direction = 2
      }
      // if (element < l_element && element < r_element) localMinima.push(i)
    }
    let i = 1
    let j = hueHistogram.length - 1
    while (direction === 1) {
      const element = hueHistogram[i]
      const l_element = hueHistogram[j]

      if (element < l_element) {
        direction = 1
      } else if (element > l_element) {
        if (direction === 1) {
          localMinima.push(j)
        }
        direction = 2
      }
      i++
      j = (j + 1) % (hueHistogram.length - 1)
    }
    return localMinima
  }
  createFinestSegmentation() {
    const localMinima = this.findLocalMinima()
    console.log(localMinima.length, localMinima)
  }

  clustering(n = 5) {
    const vectors = []
    const { colors } = this
    for (let i = 0; i < colors.length; i++) {
      vectors[i] = Object.values(colors[i].lab)
    }
    console.log("colors in clustering", colors)
    kmeans.clusterize(
      vectors,
      { k: n, distance: Color.distance },
      (err, res) => {
        if (err) console.error(err)
        else console.log("%o", res)
      }
    )
  }
}
