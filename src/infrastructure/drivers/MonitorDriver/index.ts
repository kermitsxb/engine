import type { Config } from '@domain/services/Monitor'
import type { Driver } from '@adapter/spi/drivers/MonitorSpi'
import { SentryDriver } from './SentryDriver'
import { ConsoleDriver } from './ConsoleDriver'

export class MonitorDriver implements Driver {
  private _monitors: (SentryDriver | ConsoleDriver)[] = []

  constructor(config: Config) {
    for (const monitor of config) {
      const { driver } = monitor
      switch (driver) {
        case 'Sentry':
          this._monitors.push(new SentryDriver())
          break
        case 'Console':
          this._monitors.push(new ConsoleDriver())
          break
        default:
          throw new Error('Invalid driver')
      }
    }
  }

  captureException = (error: Error) => {
    this._monitors.map((m) => m.captureException(error))
  }

  captureMessage = (message: string) => {
    this._monitors.map((m) => m.captureMessage(message))
  }
}
