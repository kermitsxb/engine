import type { FilterConfig } from '@domain/entities/Filter'
import type { Config } from '@domain/entities/Expect/Record'

export interface Record extends Config {
  expect: 'Record'
  find: FilterConfig
}
