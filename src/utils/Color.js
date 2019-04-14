import colordiff from "color-diff"

export default class Color {
  constructor(rgbString, weight = 0) {
    this.weight = weight
    this.original = rgbString
    let rgb = rgbString.replace(/[^\d,.]/g, "").split(",")
    let isRgba = rgb.length === 4
    this.rgba = isRgba
      ? { R: rgb[0], G: rgb[1], B: rgb[2], A: rgb[3] }
      : { R: rgb[0], G: rgb[1], B: rgb[2], A: 1 }
  }
  static distance(a, b) {
    return colordiff.diff(
      { L: a[0], a: a[1], b: a[2] },
      { L: b[0], a: b[1], b: b[2] }
    )
  }
  static lab_to_rgbstr(lab) {
    return this.rgba_to_string(this.lab_to_rgb(lab))
  }
  static rgba_to_string(rgba) {
    const { r, g, b, a = 1 } = rgba
    return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})` 
  }
  static lab_to_rgb(lab) {
    let y = (lab.L + 16) / 116,
      x = lab.a / 500 + y,
      z = y - lab.b / 200,
      r,
      g,
      b

    x = 0.95047 * (x * x * x > 0.008856 ? x * x * x : (x - 16 / 116) / 7.787)
    y = 1.0 * (y * y * y > 0.008856 ? y * y * y : (y - 16 / 116) / 7.787)
    z = 1.08883 * (z * z * z > 0.008856 ? z * z * z : (z - 16 / 116) / 7.787)

    r = x * 3.2406 + y * -1.5372 + z * -0.4986
    g = x * -0.9689 + y * 1.8758 + z * 0.0415
    b = x * 0.0557 + y * -0.204 + z * 1.057

    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b

    return {
      r: Math.max(0, Math.min(1, r)) * 255,
      g: Math.max(0, Math.min(1, g)) * 255,
      b: Math.max(0, Math.min(1, b)) * 255
    }
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
