import { drivers } from '@infrastructure/drivers'
import { integrations } from '@infrastructure/integrations'
import App from '@adapter/api'
import type { Drivers } from '@adapter/spi/drivers'
import type { Integrations } from '@adapter/spi/integrations'

export type { Config } from '@domain/interfaces'
export type { IAutomation as Automation } from '@domain/interfaces/IAutomation'
export type { IAction as Action } from '@domain/interfaces/IAction'
export type { ITrigger as Trigger } from '@domain/interfaces/ITrigger'
export type { ITable as Table } from '@domain/interfaces/ITable'
export type { IField as Field } from '@domain/interfaces/IField'
export type { FilterConfig as Filter } from '@domain/entities/Filter'
export type { IBucket as Bucket } from '@domain/interfaces/IBucket'
// export type { IPage as Page } from '@adapter/api/configs/Page'
// export type { IComponent as Component } from '@adapter/api/configs/Component'
// export type { IHead as Head } from '@adapter/api/configs/Head'
// export type { IEvent as Event } from '@adapter/api/configs/Event'
// export type { IExpect as Expect } from '@adapter/api/configs/Expect'
// export type { ITest as Test } from '@adapter/api/configs/Test'
export type {
  DatabaseConfig as Database,
  MailerConfig as Mailer,
  LoggersConfig as Loggers,
  MonitorsConfig as Monitors,
  ServerConfig as Server,
  TunnelConfig as Tunnel,
  // AuthConfig as Auth,
  // ThemeConfig as Theme,
} from '@domain/interfaces/IServices'
export type {
  CodeRunnerContext,
  CodeRunnerContextServicesDatabase as DatabaseIntegration,
  CodeRunnerContextServicesDatabaseTable as DatabaseTable,
  CodeRunnerContextIntegrationsNotion as NotionIntegration,
  CodeRunnerContextIntegrationsNotionTable as NotionTable,
} from '@domain/services/CodeRunner'
export {
  NotionTablePage,
  type NotionTablePageProperties,
  type NotionTablePagePropertyValue,
} from '@domain/integrations/Notion/NotionTablePage'
export type { NotionUser } from '@domain/integrations/Notion/NotionUser'
export {
  Record as DatabaseTableRecord,
  type RecordFields as DatabaseTableRecordFields,
  type RecordFieldValue as DatabaseTableRecordFieldValue,
  type UpdateRecordFields as DatabaseTableUpdateRecordFields,
} from '@domain/entities/Record'
export type { AppIntegrations } from '@domain/entities/App/Base'
export type { StartedApp } from '@domain/entities/App/Started'
export type { StoppedApp } from '@domain/entities/App/Stopped'
export { packages } from '@infrastructure/drivers/shared/CodeCompilerDriver/JavascriptRunnerDriver'

export default class extends App {
  constructor(options?: { drivers?: Partial<Drivers>; integrations?: Partial<Integrations> }) {
    const customDrivers = options?.drivers ?? {}
    const customIntegrations = options?.integrations ?? {}
    super({ ...drivers, ...customDrivers }, { ...integrations, ...customIntegrations })
  }
}
