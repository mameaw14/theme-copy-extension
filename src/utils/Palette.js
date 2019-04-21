import Color from "./Color"
import kmeans from "./kmeans"

const WHITE = new Color("white")
const BLACK = new Color("black")

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
  groupByHue() {
    const { colors } = this
    const groups = {}
    for (let i = 0; i < colors.length; i++) {
      const color = colors[i]
      let hue = Math.round(color.hue)
      if (!(hue in groups)) {
        groups[hue] = []
      }
      groups[hue].push(i)
    }
    console.log(`group by hue: ${groups}`)
    return groups
  }
  clusterByHue() {
    const { colors } = this
    const groupByHue = this.groupByHue()
    const clusters = []
    let currentHue = -1
    for (let g in groupByHue) {
      const hue = g
      const set = groupByHue[hue]

      if (currentHue === -1 || hue - currentHue <= 2) {
        clusters.push({
          clusterInd: [],
          hue: [],
          cluster: []
        })
      }
      clusters[clusters.length - 1].hue.push(hue)
      for (let i of set) {
        clusters[clusters.length - 1].clusterInd.push(i)
        clusters[clusters.length - 1].cluster.push(colors[i])
      }
      currentHue = hue
    }
    const LAST_ID = clusters.length - 1
    const firstCluster = clusters[0]
    const lastCluster = clusters[LAST_ID]
    if (Math.min(...firstCluster.hue)+361-Math.max(...lastCluster.hue) <= 2) {
      for(let p of Object.keys(clusters[0])) {
        cluster[0][p] = [...clusters[0][p], ...clusters[LAST_ID][p]]
      }
      clusters.pop()
    }

    for (let cluster of clusters) {
      cluster.centroid = Math.min(...cluster.clusterInd)
    }
    return cluster
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

  async clustering(k = 5) {
    const vectors = []
    const { colors } = this
    for (let i = 0; i < colors.length; i++) {
      if (colors[i].getAlpha() < 1) {
        const overlayBg = Color.equals(colors[i].clone().setAlpha(1), WHITE)
          ? BLACK
          : WHITE
        const newColor = Color.mix(colors[i], overlayBg)
        vectors[i] = Object.values(newColor.lab)
      } else {
        vectors[i] = Object.values(colors[i].lab)
      }
    }
    let results
    await kmeans.clusterize(
      vectors,
      { k, distance: Color.distance },
      (err, res) => {
        if (err) console.error(err)
        else results = res
      }
    )
    return results
  }
  async getNColors(n = 5) {
    const { colors } = this
    const clusteringResults = await this.clustering(n)
    const results = {}
    for (let cluster of clusteringResults) {
      const weight = cluster.clusterInd.reduce((p, c) => {
        p + colors[c].weight
      }, 0)
      results[colors[cluster.clusterInd[0]].original] = weight
    }
    return results
  }
  async getNColorsAndClusteringResults(n = 5) {
    const { colors } = this
    const clusteringResults = await this.clustering(n)
    const results = {}
    for (let cluster of clusteringResults) {
      const weight = cluster.clusterInd.reduce((p, c) => {
        p + colors[c].weight
      }, 0)
      results[colors[cluster.clusterInd[0]].original] = weight
    }
    return { clusters: clusteringResults, results }
  }
}
