import { test, expect } from '@tests/fixtures'
import App, { type App as Config } from '@safidea/engine'

test.describe('Theme', () => {
  test('should return a css file', async ({ page }) => {
    // GIVEN
    const config: Config = {
      name: 'Theme',
      features: [
        {
          name: 'theme',
          pages: [
            {
              name: 'theme',
              path: '/',
              body: [
                {
                  component: 'Paragraph',
                  text: 'Hello world!',
                },
              ],
            },
          ],
        },
      ],
    }
    const app = new App()
    const url = await app.start(config)

    // WHEN
    await page.goto(url + '/output.css')

    // THEN
    const fileContent = await page.evaluate(() => document.body.innerText)
    expect(fileContent).toContain('tailwindcss')
  })

  test('should build the css file with a custom font', async ({ page }) => {
    // GIVEN
    const config: Config = {
      name: 'Theme',
      features: [
        {
          name: 'theme',
          pages: [
            {
              name: 'theme',
              path: '/',
              body: [
                {
                  component: 'Paragraph',
                  text: 'Hello world!',
                },
              ],
            },
          ],
        },
      ],
      theme: {
        fontFamily: {
          sans: ['"Open Sans"', 'sans-serif'],
        },
      },
    }
    const app = new App()
    const url = await app.start(config)

    // WHEN
    await page.goto(url + '/output.css')
    const fileContent = await page.evaluate(() => document.body.innerText)

    // THEN
    expect(fileContent).toContain('"Open Sans", sans-serif')
  })
})
