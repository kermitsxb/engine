import Tester, { expect, describe, it } from 'bun:test'
import { Mock, type Config } from '/test/bun'

const mock = new Mock(Tester, { drivers: ['Database'] })

mock.page(({ app, browser }) => {
  const config: Config = {
    name: 'App',
    version: '1.0.0',
    forms: [
      {
        name: 'Form',
        path: 'user',
        table: 'users',
        inputs: [],
      },
    ],
    tables: [
      {
        name: 'users',
        fields: [],
      },
    ],
  }

  describe('on open page', () => {
    it('should return link to style.css', async () => {
      // GIVEN
      const { page } = browser
      const { url } = await app.start(config)

      // WHEN
      await page.goto(`${url}/form/user`)

      // THEN
      const html = await page.content()
      expect(html).toContain('<link href="/style.css" rel="stylesheet">')
    })

    it('should return the tailwind css content', async () => {
      // GIVEN
      const { page } = browser
      const { url } = await app.start(config)

      // WHEN
      const response = await page.goto(`${url}/style.css`)

      // THEN
      const css = await response?.text()
      expect(css).toContain('tailwindcss')
    })

    it('should return link to style.js', async () => {
      // GIVEN
      const { page } = browser
      const { url } = await app.start(config)

      // WHEN
      await page.goto(`${url}/form/user`)

      // THEN
      const html = await page.content()
      expect(html).toContain('<script src="/style.js">')
    })

    it('should return the preline js content', async () => {
      // GIVEN
      const { page } = browser
      const { url } = await app.start(config)

      // WHEN
      const response = await page.goto(`${url}/style.js`)

      // THEN
      const js = await response?.text()
      expect(js).toContain('preline')
    })
  })
})
