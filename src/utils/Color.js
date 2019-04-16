import colordiff from "color-diff"
import _ from "underscore"
export default class Color {
  constructor(rgbString, weight = 0) {
    this.weight = weight
    if (_.isObject(rgbString)) {
      this.rgba = rgbString
      if (!("A" in this.rgba)) this.rgba.A = 1
      this.original = this.constructor.rgba_to_string(this.rgba)
    } else {
      this.original = rgbString
      let rgb = rgbString.replace(/[^\d,.]/g, "").split(",")
      let isRgba = rgb.length === 4
      this.rgba = isRgba
        ? { R: rgb[0], G: rgb[1], B: rgb[2], A: rgb[3] }
        : { R: rgb[0], G: rgb[1], B: rgb[2], A: 1 }
    }
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
    const { R, G, B, A = 1 } = rgba
    return A === 1 ? `rgb(${R}, ${G}, ${B})` : `rgba(${R}, ${G}, ${B}, ${A})`
  }
  static lab_to_rgb(lab) {
    // https://github.com/antimatter15/rgb-lab/blob/master/color.js

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
      R: Math.max(0, Math.min(1, r)) * 255,
      G: Math.max(0, Math.min(1, g)) * 255,
      B: Math.max(0, Math.min(1, b)) * 255
    }
  }
  get luminance() {
    // https://github.com/LeaVerou/contrast-ratio/blob/gh-pages/color.js
    // Formula: http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
    const _rgba = this.rgba
    const rgba = [_rgba.R, _rgba.G, _rgba.B]
    for (let i = 0; i < 3; i++) {
      let rgb = rgba[i]

      rgb /= 255

      rgb = rgb < 0.03928 ? rgb / 12.92 : Math.pow((rgb + 0.055) / 1.055, 2.4)

      rgba[i] = rgb
    }

    return 0.2126 * rgba[0] + 0.7152 * rgba[1] + 0.0722 * rgba[2]
  }

  overlayOn(color) {
    // https://github.com/LeaVerou/contrast-ratio/blob/gh-pages/color.js
    let overlaid = this.rgba

    var alpha = this.rgba.A

    if (alpha >= 1) {
      return overlaid
    }

    for (let i of ["R", "G", "B"]) {
      overlaid[i] =
        overlaid[i] * alpha + color.rgba[i] * color.rgba.A * (1 - alpha)
    }

    overlaid.A = alpha + color.rgba.A * (1 - alpha)

    return new Color(overlaid)
  }

  contrast(color) {
    // https://github.com/LeaVerou/contrast-ratio/blob/gh-pages/color.js
    // Formula: http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
    let alpha = this.rgba.A

    if (alpha >= 1) {
      if (color.rgba.A < 1) {
        color = color.overlayOn(this)
      }

      var l1 = this.luminance + 0.05,
        l2 = color.luminance + 0.05,
        ratio = l1 / l2

      if (l2 > l1) {
        ratio = 1 / ratio
      }

      return {
        ratio: ratio,
        error: 0,
        min: ratio,
        max: ratio
      }
    }

    // If we’re here, it means we have a semi-transparent background
    // The text color may or may not be semi-transparent, but that doesn't matter

    var onBlack = this.overlayOn(_BLACK),
      onWhite = this.overlayOn(_WHITE),
      contrastOnBlack = onBlack.contrast(color).ratio,
      contrastOnWhite = onWhite.contrast(color).ratio

    var max = Math.max(contrastOnBlack, contrastOnWhite)

    // This is here for backwards compatibility and not used to calculate
    // `min`.  Note that there may be other colors with a closer luminance to
    // `color` if they have a different hue than `this`.
    var closest = {
      R: Math.min(
        Math.max(0, (color.rgba.R - this.rgba.R * alpha) / (1 - alpha)),
        255
      ),
      G: Math.min(
        Math.max(0, (color.rgba.G - this.rgba.G * alpha) / (1 - alpha)),
        255
      ),
      B: Math.min(
        Math.max(0, (color.rgba.B - this.rgba.B * alpha) / (1 - alpha)),
        255
      )
    }

    closest = new Color(closest)

    var min = 1
    if (onBlack.luminance > color.luminance) {
      min = contrastOnBlack
    } else if (onWhite.luminance < color.luminance) {
      min = contrastOnWhite
    }

    return {
      ratio: floor((min + max) / 2, 2),
      error: floor((max - min) / 2, 2),
      min: min,
      max: max,
      closest: closest,
      farthest: onWhite == max ? _.WHITE : _.BLACK
    }
  }

  get lab() {
    if (this._lab) return this._lab
    this._lab = colordiff.rgba_to_lab(this.rgba)
    return this._lab
  }
  get hue() {
    // https://github.com/brehaut/color-js/blob/master/color.js
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


const _BLACK = new Color({ R: 0, B: 0, G: 0 })
const _WHITE = new Color({ R: 255, B: 255, G: 255 })