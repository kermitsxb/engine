import type { Logger } from '@domain/services/Logger'
import type { Server } from '@domain/services/Server'
import type { Database } from '@domain/services/Database'
import type { Table } from '../Table'
import type { Page } from '../Page'
import type { Bucket } from '../Bucket'
import type { Automation } from '../Automation'
import type { Queue } from '@domain/services/Queue'
import type { Mailer } from '@domain/services/Mailer'
import type { Realtime } from '@domain/services/Realtime'
import type { Auth } from '@domain/services/Auth'
import type { Theme } from '@domain/services/Theme'
import type { Storage } from '@domain/services/Storage'
import type { Monitor } from '@domain/services/Monitor'
import type { Notion } from '@domain/integrations/Notion'

export interface AppConfig {
  name: string
}

export interface AppServices {
  logger: Logger
  server: Server
  theme: Theme
  database: Database
  queue: Queue
  mailer: Mailer
  realtime: Realtime
  auth: Auth
  storage: Storage
  monitor: Monitor
}

export interface AppEntities {
  tables: Table[]
  pages: Page[]
  automations: Automation[]
  buckets: Bucket[]
}

export interface AppIntegrations {
  notion: Notion
}

type Status = 'stopped' | 'starting' | 'started' | 'stopping'

export class BaseApp {
  public name: string
  public database: Database
  public storage: Storage
  public queue: Queue
  public mailer: Mailer
  public logger: Logger
  public status: Status = 'stopped'

  constructor(
    protected _config: AppConfig,
    protected _services: AppServices,
    protected _entities: AppEntities,
    public integrations: AppIntegrations
  ) {
    const { name } = _config
    const { database, queue, mailer, storage, logger } = _services
    this.name = name
    this.database = database
    this.queue = queue
    this.storage = storage
    this.mailer = mailer
    this.logger = logger
  }

  getTable = (name: string): Table => {
    const table = this._entities.tables.find((table) => table.name === name)
    if (!table) throw new Error(`table "${name}" not found`)
    return table
  }

  protected _setStatus = (status: Status) => {
    this.logger.debug(`set app status: ${status}`)
    this.status = status
  }
}
