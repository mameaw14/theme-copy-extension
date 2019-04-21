import Palette from "./Palette"

const p1 = new Palette({
  "rgb(27, 27, 27)": 0.8634472612968144,
  "rgb(31, 29, 51)": 2.9687304295942174,
  "rgb(36, 36, 36)": 14.1729405666754,
  "rgb(44, 42, 73)": 16.59415571822632,
  "rgb(45, 42, 73)": 10708.574484169138,
  "rgb(45, 44, 78)": 32.40932017747259,
  "rgb(49, 47, 80)": 0,
  "rgb(56, 53, 92)": 3.5536982423370627,
  "rgb(60, 57, 99)": 5614.920611511127,
  "rgb(67, 65, 108)": 0.456620444546103,
  "rgb(74, 71, 110)": 3.281228369551503,
  "rgb(116, 89, 200)": 1.3521545478921029,
  "rgb(219, 219, 219)": 0.8316823608066506,
  "rgb(255, 204, 0)": 0.020926201336425403
})

const p2 = new Palette({
  "rgb(51, 102, 204)": 0.6693791574721109,
  "rgb(200, 204, 209)": 0.1221882589036393,
  "rgb(248, 249, 250)": 15.504893174922454,
  "rgb(255, 255, 255)": 10383.703539408702
})

test("groupByHue", () => {
  expect(p1.groupByHue()).toEqual({
    0: [4, 9, 10],
    48: [12],
    242: [2],
    243: [11],
    244: [1, 3, 13],
    245: [5, 6, 7],
    246: [0],
    255: [8],
  })
})