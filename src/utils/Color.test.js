import Color from "./Color"

const color1 = new Color("rgb(200,200,200)")
const color2 = new Color("rgb(0,100,100)")
test("contrast ratio", () => {
  expect(color1.contrast(color2).ratio).toBeCloseTo(4.17)
})
