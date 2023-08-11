import { ReadTableRecord } from '@application/usecases/table/ReadTableRecord'
import { ListTableRecords } from '@application/usecases/table/ListTableRecords'
import { App } from '@domain/entities/app/App'
import { SoftDeleteTableRecord } from '@application/usecases/table/SoftDeleteTableRecord'
import { OrmSpi } from '@adapter/spi/orm/OrmSpi'
import { Record } from '@domain/entities/app/Record'
import { Filter } from '@domain/entities/app/Filter'
import { SyncTableRecords } from '@application/usecases/table/SyncTableRecords'
import { SyncResource } from '@domain/entities/app/Sync'

export class TableController {
  private readTableRecord: ReadTableRecord
  private listTableRecords: ListTableRecords
  private softDeleteTableRecord: SoftDeleteTableRecord
  private getSyncRecordsFunction: SyncTableRecords

  constructor(
    app: App,
    private ormSpi: OrmSpi
  ) {
    this.readTableRecord = new ReadTableRecord(ormSpi, app)
    this.listTableRecords = new ListTableRecords(ormSpi, app)
    this.softDeleteTableRecord = new SoftDeleteTableRecord(ormSpi, app)
    this.getSyncRecordsFunction = new SyncTableRecords(ormSpi, app)
  }

  async sync(records: Record[], resources: SyncResource[]) {
    return this.getSyncRecordsFunction.execute(records, resources)
  }

  async create(table: string, record: Record) {
    return this.ormSpi.create(table, record)
  }

  async createMany(table: string, records: Record[]) {
    return this.ormSpi.createMany(table, records)
  }

  async read(table: string, id: string) {
    return this.readTableRecord.execute(table, id)
  }

  async list(table: string, filters: Filter[]) {
    return this.listTableRecords.execute(table, filters)
  }

  async update(table: string, id: string, record: Record) {
    return this.ormSpi.update(table, record, id)
  }

  async delete(table: string, id: string) {
    return this.softDeleteTableRecord.execute(table, id)
  }
}
