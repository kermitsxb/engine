import pdf from 'pdf-parse'
import { test, expect, helpers, Foundation } from '../../../utils/e2e/fixtures'
import { FileStorage } from '@infrastructure/storage/FileStorage'
import INVOICES_APP from '@apps/invoices/app'

test.describe('An automation that update an invoice document from a template', () => {
  test('should save the invoice document url updated in the record', async ({
    request,
    folder,
    orm,
    converter,
  }) => {
    // GIVEN
    helpers.copyAppFile('invoices', 'templates/invoice.html', folder)
    const port = 50701
    const storage = new FileStorage(folder, 'http://localhost:' + port)
    const foundation = new Foundation({ adapters: { orm, storage, converter }, port, folder })
    await foundation.config(INVOICES_APP).start()
    const {
      invoices: [invoice],
    } = await helpers.generateRecords(INVOICES_APP, orm, 'invoices', [
      {
        customer: 'Company A',
      },
    ])

    // WHEN
    await request.patch(helpers.getUrl(port, `/api/table/invoices/${invoice.id}`), {
      data: {
        customer: 'Company B',
      },
    })

    // THEN
    const [record] = await orm.list('invoices')
    expect(record.customer).toEqual('Company B')
    const [file] = await storage.list('invoices')
    const data = await pdf(file.data)
    expect(data.text).toContain('Company B')
  })

  test('should update the invoice document from an updated item', async ({
    request,
    folder,
    orm,
    converter,
  }) => {
    // GIVEN
    helpers.copyAppFile('invoices', 'templates/invoice.html', folder)
    const port = 50702
    const storage = new FileStorage(folder, 'http://localhost:' + port)
    const foundation = new Foundation({ adapters: { orm, storage, converter }, port, folder })
    await foundation.config(INVOICES_APP).start()
    const {
      invoices_items: [invoice_item],
    } = await helpers.generateRecords(INVOICES_APP, orm, 'invoices', [
      {
        items: [
          {
            unit_price: 10,
          },
        ],
      },
    ])

    // WHEN
    await request.patch(helpers.getUrl(port, `/api/table/invoices_items/${invoice_item.id}`), {
      data: {
        unit_price: 253,
      },
    })

    // THEN
    const [record] = await orm.list('invoices_items')
    expect(record.unit_price).toEqual(253)
    const [file] = await storage.list('invoices')
    const data = await pdf(file.data)
    expect(data.text).toContain('253€')
  })
})
