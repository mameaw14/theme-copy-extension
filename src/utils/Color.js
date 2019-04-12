import colordiff from "color-diff"

export default class Color {
  constructor(rgbString) {
    let rgb = rgbString.replace(/[^\d,]/g, "").split(",")
    let isRgba = rgb.length === 4
    this.rgba = isRgba
      ? { R: rgb[0], G: rgb[1], B: rgb[2], A: rgb[3] }
      : { R: rgb[0], G: rgb[1], B: rgb[2], A: 1 }
  }
  get lab() {
    if (this._lab) return this._lab
    this._lab = colordiff.rgba_to_lab(this.rgba)
    return this._lab
  }
  get hue() {
    if (this._hue) {
      return this._hue
    }
    const { R, G, B } = this.rgba
    let min, max, delta, hue

    min = Math.min(R, G, B)
    max = Math.max(R, G, B)
    delta = max - min

    if (delta == 0) {
      hue = 0
    } else {
      if (R == max) {
        hue = (G - B) / delta
      } else if (G == max) {
        hue = 2 + (B - R) / delta
      } else {
        hue = 4 + (R - G) / delta
      }
      hue = (hue * 60 + 360) % 360
    }
    this._hue = hue
    return this._hue
  }
}
