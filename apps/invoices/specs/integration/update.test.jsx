// @ts-check
import {
  render,
  screen,
  userEvent,
  faker,
  Page,
  act,
  orm,
  waitForElementToBeRemoved,
  within,
} from './fixtures'

describe('A page that update an invoice', () => {
  it('should display the invoice data from the home page', async () => {
    // GIVEN
    // An invoice is listed on the home page
    const data = faker.generate('invoices')
    const items = []
    for (const item of data.items) {
      const row = await orm.invoices_item.create({ data: item })
      items.push(row)
    }
    data.items = items.map((item) => item.id)
    const invoice = await orm.invoice.create({ data })
    for (const item of items) {
      await orm.invoices_item.update({
        where: { id: item.id },
        data: { invoice: invoice.id },
      })
    }

    // WHEN
    // We open the update page with an invoice
    await act(async () => {
      render(<Page path="/update/[id]" pathParams={{ id: invoice.id }} />)
    })

    // THEN
    // The invoice data should be displayed
    /** @type {HTMLInputElement} */
    const companyField = screen.getByLabelText('Client')
    expect(companyField.value).toContain(invoice.customer)
    const rows = screen.getAllByRole('row')
    for (let i = 0; i < items.length; i++) {
      const row = rows[i + 1]
      const utils = within(row)
      /** @type {HTMLInputElement} */
      const field = utils.getByPlaceholderText('Activité')
      expect(field.value).toContain(items[i].activity)
    }
  })

  it('should update an invoice in realtime', async () => {
    // GIVEN
    // An invoice is loaded in the update page
    const invoice = await orm.invoice.create({
      data: faker.generate('invoices'),
    })
    await act(async () => {
      render(<Page path="/update/[id]" pathParams={{ id: invoice.id }} />)
    })

    // WHEN
    // We update the invoice data and wait for autosave
    const updatedText = ' updated'
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Client'), updatedText)
    await waitForElementToBeRemoved(screen.getByText('Saving...'))

    // THEN
    // The invoice data should be updated in database
    const updatedInvoice = await orm.invoice.findUnique({ where: { id: invoice.id } })
    const newCustomerValue = invoice.customer + updatedText
    expect(updatedInvoice.customer).toContain(newCustomerValue)
  })
})
