import type { Driver } from '@adapter/spi/ThemeSpi'
import type { Params } from '@domain/services/Theme'
import postcss from 'postcss'
import tailwindcss, { type Config } from 'tailwindcss'
import type { RawFile } from 'tailwindcss/types/config'

export class ThemeDriver implements Driver {
  constructor(public params: Params) {}

  build = async (htmlContents: string[], fontsCss: string[]) => {
    if (htmlContents.length === 0) return '/* There is no css generated */'

    const { fontFamily } = this.params
    const theme: Config['theme'] = {}

    if (fontFamily) {
      theme.fontFamily = {}
      if (fontFamily.sans) {
        const sans = fontFamily.sans.search(' ') === -1 ? fontFamily.sans : `"${fontFamily.sans}"`
        theme.fontFamily.sans = [sans, 'sans-serif']
      }
      if (fontFamily.serif) theme.fontFamily.serif = [fontFamily.serif, 'serif']
    }

    const rawFiles: RawFile[] = htmlContents.map((raw): RawFile => ({ raw, extension: 'html' }))

    const tailwindConfig: Config = {
      darkMode: 'class',
      content: rawFiles,
      theme,
    }

    // Define the input CSS with Tailwind directives
    let inputCss = `
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    `

    if (fontsCss.length > 0) {
      inputCss += `
      @layer base {
        ${fontsCss.join('\n')}
      }
      `
    }

    // Process the CSS with PostCSS and Tailwind
    const { css } = await postcss([tailwindcss(tailwindConfig), require('autoprefixer')]).process(
      inputCss,
      { from: undefined }
    )

    return css
  }
}
