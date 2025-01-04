import type { INotionIntegration } from '@adapter/spi/integrations/NotionSpi'
import { NotionTableIntegration } from './NotionTableIntegration'
import type { NotionConfig } from '@domain/integrations/Notion'
import type { NotionUserDto } from '@adapter/spi/dtos/NotionUserDto'
import { SQLiteDatabaseDriver } from '@infrastructure/drivers/bun/DatabaseDriver/SQLiteDriver'
import { SQLiteDatabaseTableDriver } from '@infrastructure/drivers/bun/DatabaseDriver/SQLiteTableDriver'
import type { RecordFields } from '@domain/entities/Record'
import type { IField } from '@domain/interfaces/IField'

export interface TableObject extends RecordFields {
  title: string
  properties: string
}

export interface UserObject extends RecordFields {
  email: string
  name: string | null
  avatarUrl: string | null
}

export class NotionIntegration implements INotionIntegration {
  private _db: SQLiteDatabaseDriver
  private _tables?: SQLiteDatabaseTableDriver
  private _users?: SQLiteDatabaseTableDriver

  constructor(private _config?: NotionConfig) {
    this._db = new SQLiteDatabaseDriver({ url: ':memory:', driver: 'SQLite' })
  }

  connect = async () => {
    await this._db.connect()
    this._tables = this._db.table({
      name: 'tables',
      fields: [
        {
          name: 'title',
          type: 'SingleLineText',
        },
        {
          name: 'properties',
          type: 'LongText',
        },
      ],
    })
    this._users = this._db.table({
      name: 'users',
      fields: [
        {
          name: 'email',
          type: 'SingleLineText',
        },
        {
          name: 'name',
          type: 'SingleLineText',
        },
        {
          name: 'avatarUrl',
          type: 'SingleLineText',
        },
      ],
    })
    await this._tables.create()
    await this._tables.createView()
    await this._users.create()
    await this._users.createView()
  }

  getConfig = () => {
    if (!this._config) {
      throw new Error('Notion config not set')
    }
    return this._config
  }

  getTable = async (id: string) => {
    const table = await this._tablesOrThrow().readById<TableObject>(id)
    if (!table) {
      throw new Error('Table not found')
    }
    const { properties, title } = table.fields
    const fields = JSON.parse(String(properties))
    const notionTable = new NotionTableIntegration(
      this._db.table({
        name: title,
        fields,
      }),
      table
    )
    const exist = await notionTable.exists()
    if (!exist) {
      await notionTable.create()
      await notionTable.createView()
    }
    return notionTable
  }

  listAllUsers = async (): Promise<NotionUserDto[]> => {
    const users = await this._usersOrThrow().list<UserObject>()
    return users.map((user) => ({
      id: user.id,
      email: user.fields.email,
      name: user.fields.name || '',
      avatarUrl: user.fields.avatarUrl || '',
    }))
  }

  addTable = async (id: string, properties: IField[]) => {
    await this._tablesOrThrow().insert<TableObject>({
      id,
      fields: { title: id, properties: JSON.stringify(properties) },
      created_at: new Date(),
    })
    return this.getTable(id)
  }

  addUser = async (user: NotionUserDto) => {
    await this._usersOrThrow().insert<UserObject>({
      id: user.id,
      fields: {
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      created_at: new Date(),
    })
  }

  _tablesOrThrow = () => {
    if (!this._tables) {
      throw new Error('Tables table not set')
    }
    return this._tables
  }

  _usersOrThrow = () => {
    if (!this._users) {
      throw new Error('Users table not set')
    }
    return this._users
  }
}
