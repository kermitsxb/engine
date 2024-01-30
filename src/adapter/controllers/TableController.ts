import type { Drivers } from '@domain/drivers'
import { TableMiddleware } from '../middlewares/TableMiddleware'
import { Table } from '@domain/entities/table/Table'
import type { IController } from './IController'
import { Controller } from './Controller'
import type { ITable } from '@domain/entities/table/ITable'
import { TableError } from '@domain/entities/table/TableError'
import { Services } from '@domain/services/Services'
import { IdGeneratorMapper } from 'src/mappers/services/idGenerator/IdGeneratorMapper'

export class TableController extends Controller<ITable> implements IController<Table> {
  constructor(
    private drivers: Drivers,
    private params?: {
      tables?: ITable[]
    }
  ) {
    const middleware = new TableMiddleware(drivers)
    const log = drivers.logger.init('controller:table')
    super(middleware, log)
  }

  async createEntity(data: unknown) {
    const schema = this.getSchemaWithErrors(data, (message) => new TableError(message))
    if (schema.errors) return { errors: schema.errors }
    const databaseInstance = this.drivers.database.create(this.params?.tables ?? [])
    const entity = new Table(schema.json, {
      drivers: this.drivers,
      featureName: 'default',
      serverInstance: this.drivers.server.create(),
      databaseInstance,
      services: new Services({ idGenerator: new IdGeneratorMapper(this.drivers.idGenerator) }),
    })
    const errors = this.getConfigErrors(entity)
    if (errors) return { errors }
    return { entity, errors: [] }
  }
}
