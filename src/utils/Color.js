import colordiff from "color-diff"
import tinycolor from "tinycolor2"
import _ from "underscore"

export default class Color extends tinycolor {
  constructor(input, weight = 0) {
    super(input)
    this.weight = weight
  }
  static isContrastOK(a, b) {
    return tinycolor.isReadable(a, b)
  }
  static getCompatibleTextColor(toChange, toKeep) {
    const STEP = 10
    let makeItLight = toKeep.isDark()
    let newColor = toChange.lighten(50)
    while (!Color.isContrastOK(newColor, toKeep)) {
      const con = newColor.contrast(toKeep)
      if (makeItLight) {
        newColor = newColor.brighten(STEP)
      } else {
        newColor = newColor.darken(STEP)
      }
      if (
        tinycolor.equals(newColor, "white") ||
        tinycolor.equals(newColor, "black")
      ) {
        const whiteTxtLmn = toKeep.contrast("white")
        const blackTxtLmn = toKeep.contrast("black")
        if (whiteTxtLmn > blackTxtLmn) return new Color("white")
        return new Color("black")
      }
    }
    return newColor
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
  static mix(color1, color2) {
    const n = new Color(tinycolor.mix(color1, color2).toRgb())
    return n
  }
  get rgba() {
    const rgb = this.toRgb()
    return { R: rgb.r, G: rgb.g, B: rgb.b, A: rgb.a }
  }
  get original() {
    return this.getOriginalInput()
  }
  get luminance() {
    return this.getLuminance()
  }
  get hsl() {
    return this.toHsl()
  }
  get lab() {
    return colordiff.rgba_to_lab(this.rgba)
  }
  get hue() {
    return this.hsl.h
  }
  contrast(color) {
    return tinycolor.readability(this, color)
  }
}
