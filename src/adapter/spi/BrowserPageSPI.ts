import type { Driver as BrowserElementDriver } from './BrowserElementSpi'
import type { Spi } from '@domain/services/BrowserPage'

export interface Driver {
  open(url: string): Promise<void>
  title(): Promise<string>
  getByText(text: string, options?: { tag?: string }): Promise<BrowserElementDriver | undefined>
  getInputByName(input: string): Promise<BrowserElementDriver | undefined>
  getHtml(): Promise<string>
}

export class BrowserPageSpi implements Spi {
  constructor(private driver: Driver) {}

  async open(url: string) {
    return this.driver.open(url)
  }

  async title() {
    return this.driver.title()
  }

  async getByText(text: string, options?: { tag?: string }) {
    return this.driver.getByText(text, options)
  }

  async getInputByName(input: string) {
    return this.driver.getInputByName(input)
  }

  async getHtml() {
    return this.driver.getHtml()
  }
}
