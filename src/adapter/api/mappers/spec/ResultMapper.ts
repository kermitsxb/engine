import type { Result as ResultConfig } from '@adapter/api/configs/spec/Result'
import type { Result } from '@domain/entities/spec/Result'
import { Title } from '@domain/entities/spec/Result/Title'
import { Text } from '@domain/entities/spec/Result/Text'
import { InputText } from '@domain/entities/spec/Result/InputText'
import { Record } from '@domain/entities/spec/Result/Record'
import type { BaseParams as ResultParams } from '@domain/entities/spec/Result/base'
import { DatabaseFilterMapper } from '@adapter/spi/mappers/DatabaseFilterMapper'

export class ResultMapper {
  static toEntity = (config: ResultConfig, params: ResultParams): Result => {
    if ('title' in config) {
      return new Title({ ...config, ...params })
    }
    if ('text' in config) {
      return new Text({ ...config, ...params })
    }
    if ('input' in config) {
      return new InputText({ ...config, ...params })
    }
    if ('table' in config) {
      const find = config.findOne.map((filter) => DatabaseFilterMapper.toEntityFromConfig(filter))
      return new Record({ ...config, ...params, find })
    }
    throw new Error('Unknown result type')
  }

  static toManyEntities = (configs: ResultConfig[], params: ResultParams): Result[] => {
    return configs.map((config) => this.toEntity(config, params))
  }
}
