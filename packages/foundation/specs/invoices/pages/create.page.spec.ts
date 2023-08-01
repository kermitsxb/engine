import { test, expect, helpers } from '../../utils/fixtures'

test.describe('A page that create an invoice', () => {
  test('should display a title', async ({ page, foundation }) => {
    // GIVEN
    await foundation.start({
      tables: helpers.getTables('invoices'),
      pages: helpers.getPages('invoices_create'),
    })

    // WHEN
    await page.goto('/create')

    // THEN
    expect(await page.textContent('h1')).toContain('Créer une facture')
  })

  test('should fill a form and create an invoice', async ({ page, foundation }) => {
    // GIVEN
    // An invoicing app with a create page
    const db = await foundation.start({
      tables: helpers.getTables('invoices'),
      pages: helpers.getPages('invoices_list', 'invoices_create'),
    })

    // WHEN
    // I go to the create page "/create"
    await page.goto('/create')

    // AND
    // I fill the form
    const invoice = helpers.generateRecord('invoices')
    await page.waitForSelector('input[name="customer"]', { state: 'visible' })
    await page.locator('input[name="customer"]').fill(String(invoice.customer))
    await page.locator('input[name="address"]').fill(String(invoice.address))
    await page.locator('input[name="zip_code"]').fill(String(invoice.zip_code))
    await page.locator('input[name="country"]').fill(String(invoice.country))
    if (
      typeof invoice.items === 'object' &&
      'create' in invoice.items &&
      Array.isArray(invoice.items.create)
    ) {
      for (let i = 0; i < invoice.items.create.length; i++) {
        await page.click('text=Nouvelle ligne')

        const activitySelector = `input[placeholder="Activité"][value=""]`
        const unitySelector = `input[placeholder="Unité"][value=""]`
        const quantitySelector = `input[placeholder="Quantité"][value=""]`
        const unitPriceSelector = `input[placeholder="Prix unitaire"][value=""]`

        await page.locator(activitySelector).fill(String(invoice.items.create[i].activity))
        await page.locator(unitySelector).fill(String(invoice.items.create[i].unity))
        await page.locator(quantitySelector).fill(String(invoice.items.create[i].quantity))
        await page.locator(unitPriceSelector).fill(String(invoice.items.create[i].unit_price))
      }
    }

    // AND
    // I click on the submit button
    await page.locator('button[type="submit"]').click()

    // THEN
    // An invoice should be created
    const [invoiceRecord] = await db.list('invoices')
    expect(invoiceRecord).toBeDefined()
    expect(invoiceRecord.id).toBeDefined()
    expect(invoiceRecord.customer).toEqual(invoice.customer)
  })
})
