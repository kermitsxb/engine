import { OrmGateway } from '@adapter/spi/gateways/OrmGateway'
import { RecordToCreateDto } from '@application/dtos/table/RecordDto'
import { mapDtoToRecord } from '@application/mappers/table/RecordMapper'
import { CreateTableRecord } from './CreateTableRecord'
import { App } from '@domain/entities/App'

export class CreateManyTableRecord {
  private createTableRecord: CreateTableRecord

  constructor(
    private ormGateway: OrmGateway,
    private app: App
  ) {
    this.createTableRecord = new CreateTableRecord(ormGateway, app)
  }

  async execute(table: string, records: RecordToCreateDto[]): Promise<string[]> {
    const fields = this.app.getTableFields(table)
    const recordsDtos = await Promise.all(
      records.map((record) => this.createTableRecord.buildRecordDto(table, record, fields))
    )
    return this.ormGateway.createMany(
      table,
      recordsDtos.map((record) => mapDtoToRecord(table, record, fields))
    )
  }
}
