import { IOrmSpi } from '@domain/spi/IOrmSpi'
import { Record } from '@domain/entities/orm/Record'
import { StartedState } from '@adapter/spi/server/ServerSpi/StartedState'
import { App } from '@domain/entities/app/App'
import { CreateAutomationContextFromRecordId } from '../automation/CreateAutomationContextFromRecordId'
import { ReadTableRecord } from './ReadTableRecord'

export class UpdateTableRecord {
  private createAutomationContextFromRecord: CreateAutomationContextFromRecordId
  private readTableRecord: ReadTableRecord

  constructor(
    private ormSpi: IOrmSpi,
    app: App,
    private instance: StartedState
  ) {
    this.createAutomationContextFromRecord = new CreateAutomationContextFromRecordId(ormSpi, app)
    this.readTableRecord = new ReadTableRecord(ormSpi, app)
  }

  async execute(table: string, record: Record, id: string): Promise<string> {
    const persistedRecord = await this.readTableRecord.execute(table, id)
    await this.ormSpi.update(table, record, id)
    await this.emitEvent(table, record, persistedRecord)
    return id
  }

  async emitEvent(table: string, record: Record, persistedRecord: Record) {
    const context = await this.createAutomationContextFromRecord.execute(table, record.id)
    const updatedFields: string[] = []
    for (const field of Object.keys(record.fields)) {
      if (
        JSON.stringify(record.getFieldValue(field)) !==
        JSON.stringify(persistedRecord.getFieldValue(field))
      ) {
        updatedFields.push(field)
      }
    }
    context.updatedFields = updatedFields
    await this.instance.emit('record_updated', context)
  }
}
