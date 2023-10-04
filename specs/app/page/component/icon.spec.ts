import { test, expect, helpers, drivers } from '@test/e2e/fixtures'

test.describe('Icon component', () => {
  for (const ui of drivers.ui) {
    test.describe(ui.name, () => {
      test('should have width property by default', async ({ page }) => {
        // GIVEN
        const app = await helpers.startApp(
          {
            pages: [
              {
                path: '/',
                title: 'Home',
                components: [
                  {
                    type: 'icon',
                    name: 'home',
                  },
                ],
              },
            ],
          },
          {
            ui: ui.value as any,
          }
        )

        // WHEN
        await page.goto(helpers.getUrl(app.port, '/'))

        // THEN
        const iconWidth = await page.locator('svg').getAttribute('data-size')
        expect(iconWidth).toEqual('5')
      })

      test('should have a custom width property', async ({ page }) => {
        // GIVEN
        const app = await helpers.startApp(
          {
            pages: [
              {
                path: '/',
                title: 'Home',
                components: [
                  {
                    type: 'icon',
                    name: 'home',
                    size: 10,
                  },
                ],
              },
            ],
          },
          {
            ui: ui.value as any,
          }
        )

        // WHEN
        await page.goto(helpers.getUrl(app.port, '/'))

        // THEN
        const iconWidth = await page.locator('svg').getAttribute('data-size')
        expect(iconWidth).toEqual('10')
      })
    })
  }
})
