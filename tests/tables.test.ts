import { test, expect } from '@playwright/test'
import { createApp, type IApp } from '@solumy/engine'

test.describe('App with tables', () => {
  test('should create a row when request table api', async ({ request }) => {
    // GIVEN
    const config: IApp = {
      name: 'App',
      features: [
        {
          name: 'Feature',
          tables: [
            {
              name: 'leads',
              fields: [
                {
                  name: 'name',
                  type: 'SingleLineText',
                },
              ],
            },
          ],
        },
      ],
    }
    const { app } = await createApp(config)
    const url = await app!.start()

    // WHEN
    const res = await request.post(`${url}/api/table/leads`, {
      data: { name: 'John' },
    })

    // THEN
    expect(res.ok()).toBeTruthy()
    const { record } = await res.json()
    expect(record).toBeDefined()
    expect(record.id).toBeDefined()
    expect(record.name).toBe('John')
  })

  test.skip('should create a row in database when request table api', async ({ request }) => {
    // GIVEN
    const config: IApp = {
      name: 'App',
      features: [
        {
          name: 'Feature',
          tables: [
            {
              name: 'leads',
              fields: [
                {
                  name: 'name',
                  type: 'SingleLineText',
                },
              ],
            },
          ],
        },
      ],
    }
    const { app } = await createApp(config)
    const url = await app!.start()

    // WHEN
    await request.post(`${url}/api/table/leads`, {
      data: { name: 'John' },
    })

    // THEN
    const row = await app!.database?.table('leads').find({ name: 'John' })
    expect(row).toBeDefined()
    expect(row!.id).toBeDefined()
    expect(row!.name).toBe('John')
  })
})
