import { PostgresDriver } from './PostgresDriver'
import { SqliteDriver } from './SqliteDriver'
import type { Config } from '@domain/services/Storage'
import type { Driver } from '@adapter/spi/StorageSpi'

export class StorageDriver implements Driver {
  private _storage: PostgresDriver | SqliteDriver

  constructor({ driver, query, exec }: Config) {
    switch (driver) {
      case 'PostgreSQL':
        this._storage = new PostgresDriver(query, exec)
        break
      case 'SQLite':
        this._storage = new SqliteDriver(query, exec)
        break
      default:
        throw new Error('Invalid driver')
    }
  }

  connect = async () => {
    await this._storage.connect()
  }

  bucket = (name: string) => {
    return this._storage.bucket(name)
  }
}
