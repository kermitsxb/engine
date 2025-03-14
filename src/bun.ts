import { drivers } from '/infrastructure/drivers/bun'
import { integrations } from '/infrastructure/integrations/bun'
import { components } from '/infrastructure/components/tailwindcss'
import App from '/adapter/api'
import type { Drivers } from '/adapter/spi/drivers'
import type { Integrations } from '/adapter/spi/integrations'
import type { Components } from './adapter/spi/components'

export default class extends App {
  constructor(options?: {
    drivers?: Partial<Drivers>
    integrations?: Partial<Integrations>
    components?: Partial<Components>
  }) {
    const customDrivers = options?.drivers ?? {}
    const customIntegrations = options?.integrations ?? {}
    const customComponents = options?.components ?? {}
    super(
      { ...drivers, ...customDrivers },
      { ...integrations, ...customIntegrations },
      { ...components, ...customComponents }
    )
  }
}
