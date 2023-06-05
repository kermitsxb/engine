import debug from 'debug'
import TableService from '../services/table.service'

import type { RouteControllerType } from 'server-common'
import type { DatabaseDataType } from 'shared-database'

const log: debug.IDebugger = debug('controller:table')

class TableController {
  public create: RouteControllerType = async (req) => {
    const { table } = req.query
    const row = await TableService.create(table, {
      data: req.body as DatabaseDataType,
    })
    log(`Created new row in ${table} with ID ${row.id}`)
    return { json: row }
  }

  public update: RouteControllerType = async (req) => {
    const { table, id } = req.query
    const row = await TableService.update(table, {
      id,
      data: req.body as DatabaseDataType,
    })
    log(`Updated row in ${table} with ID ${row.id}`)
    return { json: row }
  }

  public read: RouteControllerType = async (req) => {
    const { table, id } = req.query
    const row = await TableService.read(table, { id })
    if (row) log(`Got row in ${table} with ID ${row.id}`)
    return { json: row }
  }

  public list: RouteControllerType = async (req) => {
    const { table } = req.query
    const rows = await TableService.list(table)
    log(`Got all rows in ${table}`)
    return { json: rows }
  }

  public delete: RouteControllerType = async (req) => {
    const { table, id } = req.query
    const row = await TableService.delete(table, { id })
    log(`Deleted row in ${table} with ID ${row.id}`)
    return { json: row }
  }
}

export default new TableController()
