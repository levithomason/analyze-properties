import Color from 'color'

// units
const val = val => parseInt(val, 10)
const rem = val => `${val}rem`
const em = val => `${val}em`
const px = val => `${Math.round(val)}px`

const white = Color('#fff')
const black = Color('#000')

const darkMixer = color => Color('#666')
const lightMixer = color => Color('#eee')

const hsv = (h, s, v) => Color.hsv(h, s, v).alpha(1)

// settings
const saturation = 100
const value = 100

const bgForText = (bgColor, textColor) => {
  const darkener = darkMixer(bgColor)
  const lightener = lightMixer(bgColor)

  const isLightText = textColor.light()

  // mute shadows (light text) or highlights (dark text)
  const muted = bgColor.mix(isLightText ? darkener : lightener, 0.4)

  // get text contrast on muted background (contrast returns 0 - 21)
  const textContrast = 1 - muted.contrast(textColor) / 21

  //
  const contrasted = muted.mix(isLightText ? lightener : darkener, textContrast)

  // console.debug(
  //   'white', (contrast * 100).toFixed(),
  //   'black', (result.contrast(black) / 21 * 100).toFixed(),
  //   'contrastWhite', contrast,
  //   'saturation', final.saturationv(),
  // )

  return isLightText
    ? contrasted
        .saturate(textContrast * (1 - contrasted.saturationv() / 100))
        .darken(textContrast * 0.5)
    : contrasted
        // .saturate(textContrast * (1 - (contrasted.saturationv() / 100)))
        // .desaturate(textContrast * (1 - (contrasted.saturationv() / 100)))
        .lighten(textContrast * 0.4)
}

const lightestGray = Color.hsl(0, 0, 96)
const lighterGray = Color.hsl(0, 0, 84)
const lightGray = Color.hsl(0, 0, 72)
const gray = Color.hsl(0, 0, 60)
const darkGray = Color.hsl(0, 0, 50)
const darkerGray = Color.hsl(0, 0, 40)
const darkestGray = Color.hsl(0, 0, 30)

// RGB - primary, secondary, tertiary colors
// https://en.wikipedia.org/wiki/Tertiary_color#RGB_or_CMY_primary.2C_secondary.2C_and_tertiary_colors
const red = hsv(0, saturation, value) // 0
const orange = hsv(30, saturation, value) // 30
const yellow = hsv(60, saturation, value) // 60
const chartreuse = hsv(90, saturation, value) // 90
const green = hsv(120, saturation, value) // 120
const spring = hsv(150, saturation, value) // 150
const cyan = hsv(180, saturation, value) // 180
const azure = hsv(210, saturation, value) // 210
const blue = hsv(240, saturation, value) // 240
const violet = hsv(270, saturation, value) // 270
const magenta = hsv(300, saturation, value) // 300
const rose = hsv(330, saturation, value) // 330

const textRed = red.mix(darkMixer(red))
const textOrange = orange.mix(darkMixer(orange))
const textYellow = yellow.mix(darkMixer(yellow))
const textChartreuse = chartreuse.mix(darkMixer(chartreuse))
const textGreen = green.mix(darkMixer(green))
const textSpring = spring.mix(darkMixer(spring))
const textCyan = cyan.mix(darkMixer(cyan))
const textAzure = azure.mix(darkMixer(azure))
const textBlue = blue.mix(darkMixer(blue))
const textViolet = violet.mix(darkMixer(violet))
const textMagenta = magenta.mix(darkMixer(magenta))
const textRose = rose.mix(darkMixer(rose))
const textWhite = white.fade(0.8)
const textBlack = black.fade(0.8)
const textGray = gray.mix(darkMixer(gray))

const backgroundRed = bgForText(red, textWhite)
const backgroundOrange = bgForText(orange, textWhite)
const backgroundYellow = bgForText(yellow, textWhite)
const backgroundChartreuse = bgForText(chartreuse, textWhite)
const backgroundGreen = bgForText(green, textWhite)
const backgroundSpring = bgForText(spring, textWhite)
const backgroundCyan = bgForText(cyan, textWhite)
const backgroundAzure = bgForText(azure, textWhite)
const backgroundBlue = bgForText(blue, textWhite)
const backgroundViolet = bgForText(violet, textWhite)
const backgroundMagenta = bgForText(magenta, textWhite)
const backgroundRose = bgForText(rose, textWhite)
const backgroundWhite = bgForText(white, textWhite)
const backgroundBlack = bgForText(black, textWhite)
const backgroundGray = bgForText(gray, textWhite)

const theme = {
  val,
  rem,
  em,
  px,
  hsv,
  borderRadius: em(1),
  borders: {
    solid: ({ color = lighterGray }) => `0.0625em solid ${color}`,
    dotted: ({ color = lighterGray }) => `0.0625em dotted ${color}`,
  },
  colors: {
    red,
    orange,
    yellow,
    chartreuse,
    green,
    spring,
    cyan,
    azure,
    blue,
    violet,
    magenta,
    rose,
  },
  grayscale: {
    white,
    lightestGray,
    lighterGray,
    lightGray,
    gray,
    darkGray,
    darkerGray,
    darkestGray,
    black,
  },
  backgroundColors: {
    red: backgroundRed,
    orange: backgroundOrange,
    yellow: backgroundYellow,
    chartreuse: backgroundChartreuse,
    green: backgroundGreen,
    spring: backgroundSpring,
    cyan: backgroundCyan,
    azure: backgroundAzure,
    blue: backgroundBlue,
    violet: backgroundViolet,
    magenta: backgroundMagenta,
    rose: backgroundRose,
    white: backgroundWhite,
    black: backgroundBlack,
    gray: backgroundGray,
  },
  invertedBackgroundColors: {
    undefined: darkerGray,
    red: bgForText(red, white),
    orange: bgForText(orange, white),
    yellow: bgForText(yellow, white),
    chartreuse: bgForText(chartreuse, white),
    green: bgForText(green, white),
    spring: bgForText(spring, white),
    cyan: bgForText(cyan, white),
    azure: bgForText(azure, white),
    blue: bgForText(blue, white),
    violet: bgForText(violet, white),
    magenta: bgForText(magenta, white),
    rose: bgForText(rose, white),
  },
  shadows: {
    small: () => ({ boxShadow: `0 0.0625em 0.125em ${lighterGray}` }), // 1/8 blur
    medium: () => ({ boxShadow: `0 0.125em 0.25em ${lighterGray}` }), // 2/8 blur
    large: () => ({ boxShadow: `0 0.25em 0.5em ${lighterGray}` }), // 4/8 blur
    floating: () => ({ boxShadow: `0 0.5em 1em ${lighterGray}` }), // 8/8 blur
  },
  radii: {
    small: (props = {}) => ({ borderRadius: props.circular ? '12.5%' : '0.125em' }),
    medium: (props = {}) => ({ borderRadius: props.circular ? '25%' : '0.25em' }),
    large: (props = {}) => ({ borderRadius: props.circular ? '50%' : '0.5em' }),
    circular: (props = {}) => ({ borderRadius: props.circular ? '100%' : '99em' }),
  },
  textColors: {
    red: textRed,
    orange: textOrange,
    yellow: textYellow,
    chartreuse: textChartreuse,
    green: textGreen,
    spring: textSpring,
    cyan: textCyan,
    azure: textAzure,
    blue: textBlue,
    violet: textViolet,
    magenta: textMagenta,
    rose: textRose,
    white: textWhite,
    black: textBlack,
    gray: textGray,
  },
  statusBackgroundColors: {
    undefined: backgroundGray.lighten(0.75),
    info: backgroundCyan.lighten(0.75),
    success: backgroundGreen.lighten(0.75),
    warning: backgroundOrange.lighten(0.75),
    error: backgroundRed.lighten(0.75),
  },
  statusTextColors: {
    undefined: textGray,
    info: textCyan,
    success: textGreen,
    warning: textOrange,
    error: textRed,
  },
}

export default theme
