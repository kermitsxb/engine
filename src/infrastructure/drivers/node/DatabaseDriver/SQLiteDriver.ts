import SQLite from 'better-sqlite3'
import type { IDatabaseDriver } from '@adapter/spi/drivers/DatabaseSpi'
import type {
  DatabaseConfig,
  DatabaseDriverName,
  DatabaseEventType,
} from '@domain/services/Database'
import type { EventDto, EventNotificationDto } from '@adapter/spi/dtos/EventDto'
import { SQLiteDatabaseTableDriver } from './SQLiteTableDriver'
import type { ITable } from '@domain/interfaces/ITable'

interface Notification {
  id: number
  payload: string
  processed: number
}

export class SQLiteDatabaseDriver implements IDatabaseDriver {
  public db: SQLite.Database
  public driver: DatabaseDriverName = 'SQLite'
  private _interval?: Timer
  private _onNotification: ((event: EventNotificationDto) => void)[] = []

  constructor(config: DatabaseConfig) {
    const { url } = config
    const db = new SQLite(url)
    db.pragma('journal_mode = WAL')
    db.exec('PRAGMA foreign_keys = ON')
    this.db = db
  }

  connect = async (): Promise<void> => {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS _notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payload TEXT,
        processed INTEGER DEFAULT 0
      );
    `)
    const emitNotification = () => {
      const notifications = this.db
        .prepare('SELECT * FROM _notifications WHERE processed = 0')
        .all() as Notification[]
      for (const { payload, id } of notifications) {
        this.db.prepare('UPDATE _notifications SET processed = 1 WHERE id = ?').run([id])
        const { record_id, table, action } = JSON.parse(payload)
        this._onNotification.map((callback) =>
          callback({ notification: { record_id, table, action }, event: 'notification' })
        )
      }
    }
    this._interval = setInterval(emitNotification, 500)
  }

  disconnect = async (): Promise<void> => {
    if (this._interval) clearInterval(this._interval)
    this.db.close()
  }

  exec = async (query: string): Promise<void> => {
    this.db.exec(query)
  }

  query = async <T>(
    text: string,
    values: (string | number | Buffer | Date)[] = []
  ): Promise<{ rows: T[]; rowCount: number }> => {
    const stmt = this.db.prepare(text)
    const isSelect = text.trim().toUpperCase().startsWith('SELECT')
    if (isSelect) {
      const rows = stmt.all(values) as T[]
      return { rows, rowCount: rows.length }
    } else {
      const info = stmt.run(values)
      return { rows: [], rowCount: info.changes || 0 }
    }
  }

  table = (table: ITable) => {
    return new SQLiteDatabaseTableDriver(table, this.db)
  }

  on = (event: DatabaseEventType, callback: (eventDto: EventDto) => void) => {
    if (event === 'notification') this._onNotification.push(callback)
  }

  setupTriggers = async (tables: string[]) => {
    for (const table of tables) {
      this.db.exec(`
        -- Trigger for INSERT
        CREATE TRIGGER IF NOT EXISTS after_insert_${table}_trigger
        AFTER INSERT ON ${table}
        BEGIN
            INSERT INTO _notifications (payload)
            VALUES (json_object('table', '${table}', 'action', 'INSERT', 'record_id', NEW.id));
        END;
        
        -- Trigger for UPDATE
        CREATE TRIGGER IF NOT EXISTS after_update_${table}_trigger
        AFTER UPDATE ON ${table}
        BEGIN
            INSERT INTO _notifications (payload)
            VALUES (json_object('table', '${table}', 'action', 'UPDATE', 'record_id', NEW.id));
        END;
        
        -- Trigger for DELETE
        CREATE TRIGGER IF NOT EXISTS after_delete_${table}_trigger
        AFTER DELETE ON ${table}
        BEGIN
            INSERT INTO _notifications (payload)
            VALUES (json_object('table', '${table}', 'action', 'DELETE', 'record_id', OLD.id));
        END;
      `)
    }
  }
}
