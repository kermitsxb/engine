import type { Drivers } from '/adapter/spi/drivers'
import { ThemeSpi } from '/adapter/spi/drivers/ThemeSpi'
import { Theme, type ThemeConfig, type ThemeServices } from '/domain/services/Theme'

export class ThemeMapper {
  static toService(
    drivers: Drivers,
    services: ThemeServices,
    config: ThemeConfig = { type: 'tailwindcss' }
  ): Theme {
    const driver = drivers.theme(config)
    const spi = new ThemeSpi(driver)
    return new Theme(spi, services)
  }
}
