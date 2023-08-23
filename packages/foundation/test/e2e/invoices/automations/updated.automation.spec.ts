import pdf from 'pdf-parse'
import { AppDto } from '@adapter/api/app/AppDto'
import { test, expect, helpers, Foundation } from '../../../utils/e2e/fixtures'
import { FileStorage } from '@infrastructure/storage/FileStorage'

test.describe('An automation that update an invoice document from a template', () => {
  test('should save the invoice document url updated in the record', async ({
    request,
    folder,
    orm,
    converter,
  }) => {
    // GIVEN
    const config: AppDto = {
      tables: helpers.getTablesDto('invoices'),
      automations: helpers.getAutomationsDto('updated_invoice_with_html_file_template'),
    }
    helpers.copyPrivateTemplate('invoice.html', folder)
    const port = 50701
    const storage = new FileStorage(folder, 'http://localhost:' + port)
    const foundation = new Foundation({ adapters: { orm, storage, converter }, port })
    await foundation.config(config).start()
    const {
      invoices: [invoice],
    } = await helpers.generateRecords(orm, 'invoices', [
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
})
