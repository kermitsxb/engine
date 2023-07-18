import { TableRepository } from '@adapter/spi/repositories/TableRepository'
import { DataDto } from '@application/dtos/DataDto'
import { RecordDto } from '@application/dtos/RecordDto'

export class CreateTableRecord {
  constructor(private tableRepository: TableRepository) {}

  async execute(table: string, body: DataDto): Promise<RecordDto> {
    return this.tableRepository.create(table, body)
  }
}
