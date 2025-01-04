import type { Action } from '@domain/entities/Action'
import {
  RunJavascriptCodeActionMapper,
  type RunJavascriptCodeActionMapperServices,
} from './code/RunJavascriptMapper'
import {
  RunTypescriptCodeActionMapper,
  type RunTypescriptCodeActionMapperServices,
} from './code/RunTypescriptMapper'
import {
  CreateRecordDatabaseActionMapper,
  type CreateRecordDatabaseActionMapperEntities,
  type CreateRecordDatabaseActionMapperServices,
} from './database/CreateRecordMapper'
import {
  CreateDocxFromTemplateDocumentActionMapper,
  type CreateDocxFromTemplateDocumentActionMapperEntities,
  type CreateDocxFromTemplateDocumentActionMapperServices,
} from './document/CreateDocxFromTemplateMapper'
import {
  SendEmailMailerActionMapper,
  type SendEmailMailerActionMapperServices,
} from './mailer/SendEmailMapper'
import {
  CreatePdfFromXlsxSpreadsheetActionMapper,
  type CreatePdfFromXlsxSpreadsheetActionMapperServices,
} from './spreadsheet/CreatePdfFromXlsxMapper'
import {
  CreateXlsxFromTemplateSpreadsheetActionMapper,
  type CreateXlsxFromTemplateSpreadsheetActionMapperServices,
} from './spreadsheet/CreateXlsxFromTemplateMapper'
import type { IAction } from '@domain/interfaces/IAction'
import { ReadRecordDatabaseActionMapper } from './database/ReadRecordMapper'
import {
  GetCompanyPappersActionMapper,
  type GetCompanyPappersActionMapperIntegrations,
} from './pappers/GetCompanyMapper'
import {
  CreateClientQontoActionMapper,
  type CreateClientQontoActionMapperIntegrations,
} from './qonto/CreateClientMapper'
import {
  UpdatePageNotionActionMapper,
  type UpdatePageNotionActionMapperIntegrations,
} from './notion/UpdatePage'

export type ActionMapperServices = CreateRecordDatabaseActionMapperServices &
  SendEmailMailerActionMapperServices &
  RunJavascriptCodeActionMapperServices &
  RunTypescriptCodeActionMapperServices &
  CreateDocxFromTemplateDocumentActionMapperServices &
  CreateXlsxFromTemplateSpreadsheetActionMapperServices &
  CreatePdfFromXlsxSpreadsheetActionMapperServices

export type ActionMapperEntities = CreateRecordDatabaseActionMapperEntities &
  CreateDocxFromTemplateDocumentActionMapperEntities

export type ActionMapperIntegrations = GetCompanyPappersActionMapperIntegrations &
  CreateClientQontoActionMapperIntegrations &
  UpdatePageNotionActionMapperIntegrations

export class ActionMapper {
  static toEntity(
    config: IAction,
    services: ActionMapperServices,
    entities: ActionMapperEntities,
    integrations: ActionMapperIntegrations
  ): Action {
    const { action } = config
    const {
      idGenerator,
      mailer,
      templateCompiler,
      javascriptCompiler,
      typescriptCompiler,
      browser,
      documentLoader,
      spreadsheetLoader,
      fileSystem,
      logger,
      monitor,
    } = services
    const { tables, buckets } = entities
    const { pappers, qonto, notion } = integrations
    if (action === 'CreateRecord')
      return CreateRecordDatabaseActionMapper.toEntity(
        config,
        { idGenerator, templateCompiler, logger, monitor },
        { tables }
      )
    if (action === 'ReadRecord')
      return ReadRecordDatabaseActionMapper.toEntity(
        config,
        { templateCompiler, logger, monitor },
        { tables }
      )
    if (action === 'SendEmail')
      return SendEmailMailerActionMapper.toEntity(config, {
        mailer,
        templateCompiler,
        idGenerator,
        logger,
        monitor,
      })
    if (action === 'RunJavascript')
      return RunJavascriptCodeActionMapper.toEntity(config, {
        templateCompiler,
        javascriptCompiler,
        logger,
        monitor,
      })
    if (action === 'RunTypescript')
      return RunTypescriptCodeActionMapper.toEntity(config, {
        templateCompiler,
        typescriptCompiler,
        logger,
        monitor,
      })
    if (action === 'CreateDocxFromTemplate')
      return CreateDocxFromTemplateDocumentActionMapper.toEntity(
        config,
        {
          templateCompiler,
          documentLoader,
          idGenerator,
          fileSystem,
          logger,
          monitor,
        },
        { buckets }
      )
    if (action === 'CreateXlsxFromTemplate')
      return CreateXlsxFromTemplateSpreadsheetActionMapper.toEntity(
        config,
        {
          templateCompiler,
          spreadsheetLoader,
          idGenerator,
          fileSystem,
          logger,
          monitor,
        },
        { buckets }
      )
    if (action === 'CreatePdfFromXlsx')
      return CreatePdfFromXlsxSpreadsheetActionMapper.toEntity(
        config,
        {
          templateCompiler,
          spreadsheetLoader,
          browser,
          idGenerator,
          logger,
          monitor,
        },
        { buckets }
      )
    if (action === 'GetCompany')
      return GetCompanyPappersActionMapper.toEntity(
        config,
        {
          templateCompiler,
          logger,
          monitor,
        },
        {
          pappers,
        }
      )

    if (action === 'CreateClient')
      return CreateClientQontoActionMapper.toEntity(
        config,
        {
          templateCompiler,
          logger,
          monitor,
        },
        {
          qonto,
        }
      )
    if (action === 'UpdatePage')
      return UpdatePageNotionActionMapper.toEntity(
        config,
        {
          templateCompiler,
          logger,
          monitor,
        },
        {
          notion,
        }
      )
    throw new Error(`ActionMapper: Action ${action} not supported`)
  }

  static toManyEntities(
    configs: IAction[],
    services: ActionMapperServices,
    entities: ActionMapperEntities,
    integrations: ActionMapperIntegrations
  ): Action[] {
    return configs.map((config) => this.toEntity(config, services, entities, integrations))
  }
}
