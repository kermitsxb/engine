import Tester, { expect, describe, it } from 'bun:test'
import { Mock, type Config } from '/test/bun'

const mock = new Mock(Tester, { drivers: ['Database'] })

mock.page(({ app, browser }) => {
  describe('on GET', () => {
    const config: Config = {
      name: 'App',
      version: '1.0.1',
      forms: [
        {
          name: 'user',
          path: 'user',
          title: 'Form title',
          description: 'Form description',
          table: 'users',
          inputs: [
            {
              field: 'name',
              label: 'Name',
              required: true,
            },
          ],
        },
      ],
      tables: [
        {
          name: 'users',
          fields: [
            {
              name: 'name',
              type: 'SingleLineText',
            },
          ],
        },
      ],
    }

    it('should display the form title', async () => {
      // GIVEN
      const { url } = await app.start(config)

      // WHEN
      await browser.page.goto(`${url}/forms/user`)

      // THEN
      expect(browser.page.title()).resolves.toBe('Form title')
      expect(browser.page.content()).resolves.toContain('Form title')
    })

    it('should display the form description', async () => {
      // GIVEN
      const { url } = await app.start(config)

      // WHEN
      await browser.page.goto(`${url}/forms/user`)

      // THEN
      expect(browser.page.content()).resolves.toContain('Form description')
    })

    it('should display the form inputs', async () => {
      // GIVEN
      const { url } = await app.start(config)

      // WHEN
      await browser.page.goto(`${url}/forms/user`)

      // THEN
      expect(browser.page.content()).resolves.toContain('Name')
    })
  })
})
