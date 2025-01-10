import type { DatabaseConfig } from '@domain/services/Database'
import type { LoggersConfig } from '@domain/services/Logger'
import type { MonitorsConfig } from '@domain/services/Monitor'
import type { ServerConfig } from '@domain/services/Server'
import type { TunnelConfig } from '@domain/services/Tunnel'

export type { DatabaseConfig, LoggersConfig, MonitorsConfig, ServerConfig, TunnelConfig }

export type IServices = {
  server?: ServerConfig
  database?: DatabaseConfig
  monitors?: MonitorsConfig
  loggers?: LoggersConfig
  tunnel?: TunnelConfig
}
