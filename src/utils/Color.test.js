import Color from "./Color"

const color1 = new Color("rgb(200,200,200)")
const color2 = new Color("rgb(0,100,100)")
test("contrast ratio", () => {
  expect(color1.contrast(color2)).toBeCloseTo(4.17)
})
test("isReadable 1", () => {
  expect(Color.isContrastOK("#000", "#111")).toBe(false)
})
test("isReadable 2", () => {
  expect(Color.isContrastOK("#ff0088", "#5c1a72")).toBe(false)
})
test("findCompatibleColor", () => {
  expect(
    Color.isContrastOK(
      Color.getCompatibleTextColor(new Color("#000000"), new Color("#5c1a72")),
      new Color("#5c1a72")
    )
  ).toBe(true)
})
