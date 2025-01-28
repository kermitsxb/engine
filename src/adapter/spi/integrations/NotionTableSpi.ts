import { type Filter, type FilterDto } from '/domain/entities/Filter'
import type {
  INotionTableSpi,
  UpdateNotionTablePageProperties,
} from '/domain/integrations/Notion/NotionTable'
import { FilterMapper } from '../mappers/FilterMapper'
import type { NotionTablePageProperties } from '/domain/integrations/Notion/NotionTablePage'
import { NotionTablePageMapper } from '../mappers/NotionTablePageMapper'
import type { NotionTablePageDto } from '../dtos/NotionTablePageDto'

export interface INotionTableIntegration {
  id: string
  name: string
  insert: <T extends NotionTablePageProperties>(page: T) => Promise<NotionTablePageDto<T>>
  insertMany: <T extends NotionTablePageProperties>(pages: T[]) => Promise<NotionTablePageDto<T>[]>
  update: <T extends NotionTablePageProperties>(
    id: string,
    page: Partial<T>
  ) => Promise<NotionTablePageDto<T>>
  updateMany: <T extends NotionTablePageProperties>(
    pages: UpdateNotionTablePageProperties<T>[]
  ) => Promise<NotionTablePageDto<T>[]>
  retrieve: <T extends NotionTablePageProperties>(id: string) => Promise<NotionTablePageDto<T>>
  archive: (id: string) => Promise<void>
  list: <T extends NotionTablePageProperties>(
    filter?: FilterDto
  ) => Promise<NotionTablePageDto<T>[]>
}

export class NotionTableSpi implements INotionTableSpi {
  constructor(private _integration: INotionTableIntegration) {}

  get id() {
    return this._integration.id
  }

  get name() {
    return this._integration.name
  }

  insert = async <T extends NotionTablePageProperties>(page: T) => {
    const dto = await this._integration.insert(page)
    return NotionTablePageMapper.toEntity<T>(dto)
  }

  insertMany = async <T extends NotionTablePageProperties>(pages: T[]) => {
    const dtos = await this._integration.insertMany(pages)
    return NotionTablePageMapper.toManyEntities<T>(dtos)
  }

  update = async <T extends NotionTablePageProperties>(id: string, page: Partial<T>) => {
    const dto = await this._integration.update(id, page)
    return NotionTablePageMapper.toEntity<T>(dto)
  }

  updateMany = async <T extends NotionTablePageProperties>(
    pages: UpdateNotionTablePageProperties<T>[]
  ) => {
    const dtos = await this._integration.updateMany(pages)
    return NotionTablePageMapper.toManyEntities<T>(dtos)
  }

  retrieve = async <T extends NotionTablePageProperties>(id: string) => {
    const dto = await this._integration.retrieve<T>(id)
    return NotionTablePageMapper.toEntity<T>(dto)
  }

  archive = async (id: string) => {
    return this._integration.archive(id)
  }

  list = async <T extends NotionTablePageProperties>(filter?: Filter) => {
    const dtos = await this._integration.list<T>(filter ? FilterMapper.toDto(filter) : undefined)
    return NotionTablePageMapper.toManyEntities<T>(dtos)
  }
}
