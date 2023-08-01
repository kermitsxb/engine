import { describe, test, expect } from '@jest/globals'
import { Table } from '@domain/entities/table/Table'
import { mapDtoToTable } from '@application/mappers/table/TableMapper'
import { TableDto } from '@application/dtos/table/TableDto'
import { GroupBy, List, SortBy } from '@domain/entities/page/components/List'

describe('List Component', () => {
  test('config validation fail if table reference an invalid table', async () => {
    // GIVEN
    const tableName = 'tableA'

    // WHEN
    const call = () => new List(tableName, [], [], [], {} as any, [])

    // THEN
    expect(call).toThrow('tableA is not defined in tables')
  })

  test('config validation fail if groupBy reference an invalid field', async () => {
    // GIVEN
    const tableName = 'tableA'
    const groupBy: GroupBy[] = [
      {
        field: 'fieldX',
        order: 'desc',
      },
    ]
    const tables: Table[] = [
      {
        name: 'tableA',
        fields: [
          {
            name: 'fieldA',
            type: 'single_line_text',
          },
        ],
      },
    ].map((tableDto) => mapDtoToTable(tableDto as TableDto))

    // WHEN
    const call = () => new List(tableName, groupBy, [], [], {} as any, tables)

    // THEN
    expect(call).toThrow('field fieldX in groupBy is not defined in table tableA')
  })

  test('config validation fail if sortBy reference an invalid field', async () => {
    // GIVEN
    const tableName = 'tableA'
    const sortBy: SortBy[] = [
      {
        field: 'fieldX',
        order: 'desc',
      },
    ]
    const tables: Table[] = [
      {
        name: 'tableA',
        fields: [
          {
            name: 'fieldA',
            type: 'single_line_text',
          },
        ],
      },
    ].map((tableDto) => mapDtoToTable(tableDto as TableDto))

    // WHEN
    const call = () => new List(tableName, [], sortBy, [], {} as any, tables)

    // THEN
    expect(call).toThrow('field fieldX in sortBy is not defined in table tableA')
  })
})
