import BunTester, { it, expect } from 'bun:test'
import fs from 'fs-extra'
import { SQLiteDatabaseDriver } from './SQLiteDriver'
import type { IDatabaseDriver } from '/adapter/spi/drivers/DatabaseSpi'
import { testDatabaseDriver } from '/infrastructure/drivers/common/DatabaseDriver/DatabaseDriverTest'

const setup = async (): Promise<IDatabaseDriver> => {
  return new SQLiteDatabaseDriver({
    driver: 'SQLite',
    url: ':memory:',
  })
}

it('should create a database file in a folder that not exists', async () => {
  // GIVEN
  const url = './tmp/not/existing/folder/db.sqlite'

  // WHEN
  const call = () =>
    new SQLiteDatabaseDriver({
      driver: 'SQLite',
      url,
    })

  // THEN
  expect(call).not.toThrow()
  fs.unlinkSync(url)
})

testDatabaseDriver(BunTester, setup)
