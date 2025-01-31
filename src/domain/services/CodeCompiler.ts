import { type FilterConfig, FilterMapper } from '/domain/entities/Filter'
import type { NotionTablePageProperties } from '/domain/integrations/Notion/NotionTablePage'
import { CodeRunner } from './CodeRunner'
import type {
  ICodeRunnerSpi,
  CodeRunnerEntities,
  CodeRunnerIntegrations,
  CodeRunnerContextIntegrations,
  CodeRunnerContextServices,
  CodeRunnerContextServicesDatabase,
  CodeRunnerContextServicesLogger,
  CodeRunnerServices,
  CodeRunnerContextServicesFetcher,
} from './CodeRunner'
import type { RecordFields, UpdateRecordFields } from '/domain/entities/Record'
import type { UpdateNotionTablePageProperties } from '/domain/integrations/Notion/NotionTable'
import type { AirtableTableRecordFields } from '/domain/integrations/Airtable/AirtableTableRecord'
import type { UpdateAirtableTableRecord } from '/domain/integrations/Airtable/AirtableTable'

export type CodeCompilerServices = CodeRunnerServices

export type CodeCompilerEntities = CodeRunnerEntities

export type CodeCompilerIntegrations = CodeRunnerIntegrations

export interface ICodeCompilerSpi {
  compile: (code: string, env: { [key: string]: string }) => ICodeRunnerSpi
}

export interface CodeCompilerConfig {
  language: 'JavaScript' | 'TypeScript'
}

export class CodeCompiler {
  constructor(
    private _spi: ICodeCompilerSpi,
    private _services: CodeCompilerServices,
    private _entities: CodeCompilerEntities,
    private _integrations: CodeCompilerIntegrations
  ) {}

  compile = (code: string, env: { [key: string]: string }): CodeRunner => {
    const codeRunner = this._spi.compile(code, env)
    return new CodeRunner(codeRunner, this.getServices(), this.getIntegrations())
  }

  getServices = (): CodeRunnerContextServices => {
    const database: CodeRunnerContextServicesDatabase = {
      table: <T extends RecordFields>(name: string) => {
        const table = this._entities.tables.find((table) => table.name === name)
        if (!table) {
          throw new Error(`CodeRunner: Database table "${name}" not found`)
        }
        return {
          insert: async (data: T) => {
            return await table.db.insert<T>(data)
          },
          insertMany: async (data: T[]) => {
            return await table.db.insertMany<T>(data)
          },
          update: async (id: string, data: Partial<T>) => {
            return await table.db.update<T>(id, data)
          },
          updateMany: async (data: UpdateRecordFields<T>[]) => {
            return await table.db.updateMany<T>(data)
          },
          read: async (filterConfig: FilterConfig) => {
            const filter = FilterMapper.toEntity(filterConfig)
            return table.db.read<T>(filter)
          },
          readById: async (id: string) => {
            return table.db.readById<T>(id)
          },
          list: async (filterConfig?: FilterConfig) => {
            const filter = filterConfig && FilterMapper.toEntity(filterConfig)
            return await table.db.list<T>(filter)
          },
          exists: async () => {
            return table.db.exists()
          },
        }
      },
    }
    const logger: CodeRunnerContextServicesLogger = {
      error: (message: string, metadata?: object) => {
        this._services.logger.error(message, metadata)
      },
      info: (message: string, metadata?: object) => {
        this._services.logger.info(message, metadata)
      },
      debug: (message: string, metadata?: object) => {
        this._services.logger.debug(message, metadata)
      },
    }
    const fetcher: CodeRunnerContextServicesFetcher = {
      get: (url: string) => {
        return this._services.fetcher.get(url)
      },
      post: (url: string, body: object) => {
        return this._services.fetcher.post(url, body)
      },
    }
    return { database, logger, fetcher }
  }

  getIntegrations = (): CodeRunnerContextIntegrations => {
    const { notion, airtable } = this._integrations
    return {
      notion: {
        getTable: async <T extends NotionTablePageProperties>(id: string) => {
          const table = await notion.getTable(id)
          if (!table) {
            throw new Error(`CodeRunner: Notion table "${id}" not found`)
          }
          return {
            insert: async (data: T) => {
              return table.insert<T>(data)
            },
            insertMany: async (data: T[]) => {
              return table.insertMany<T>(data)
            },
            update: async (id: string, data: Partial<T>) => {
              return table.update<T>(id, data)
            },
            updateMany: async (data: UpdateNotionTablePageProperties<T>[]) => {
              return table.updateMany<T>(data)
            },
            retrieve: async (id: string) => {
              return table.retrieve<T>(id)
            },
            list: async (filterConfig?: FilterConfig) => {
              const filter = filterConfig ? FilterMapper.toEntity(filterConfig) : undefined
              return table.list<T>(filter)
            },
            archive: async (id: string) => {
              return table.archive(id)
            },
          }
        },
        listAllUsers: async () => {
          return notion.listAllUsers()
        },
      },
      airtable: {
        getTable: async <T extends AirtableTableRecordFields>(id: string) => {
          const table = await airtable.getTable(id)
          if (!table) {
            throw new Error(`CodeRunner: Airtable table "${id}" not found`)
          }
          return {
            insert: async (data: T) => {
              return table.insert<T>(data)
            },
            insertMany: async (data: T[]) => {
              return table.insertMany<T>(data)
            },
            update: async (id: string, data: Partial<T>) => {
              return table.update<T>(id, data)
            },
            updateMany: async (data: UpdateAirtableTableRecord<T>[]) => {
              return table.updateMany<T>(data)
            },
            retrieve: async (id: string) => {
              return table.retrieve<T>(id)
            },
            list: async (filterConfig?: FilterConfig) => {
              const filter = filterConfig ? FilterMapper.toEntity(filterConfig) : undefined
              return table.list<T>(filter)
            },
            delete: async (id: string) => {
              return table.delete(id)
            },
          }
        },
      },
    }
  }
}
