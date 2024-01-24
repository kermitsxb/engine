import type { ISchemaValidatorError } from '@domain/drivers/ISchemaValidator'
import { AppError } from '@domain/entities/app/AppError'
import type { IMapper } from './IMapper'

export class AppMapper implements IMapper {
  schemaValidatorToEngineErrors(errors: ISchemaValidatorError[]) {
    return errors.map((error) => {
      const { instancePath, keyword, params } = error
      if (keyword === 'required') {
        if (params.missingProperty === 'name') return new AppError('NAME_REQUIRED')
        if (params.missingProperty === 'roles') return new AppError('ROLES_REQUIRED')
        if (params.missingProperty === 'features') return new AppError('FEATURES_REQUIRED')
        if (params.missingProperty === 'components') return new AppError('COMPONENTS_REQUIRED')
        if (params.missingProperty === 'translations') return new AppError('TRANSLATIONS_REQUIRED')
      } else if (keyword === 'additionalProperties') {
        return new AppError('UNKNOWN_PROPERTY', { property: params.additionalProperty })
      } else if (keyword === 'type') {
        if (instancePath === '/name') return new AppError('NAME_STRING_TYPE_REQUIRED')
        if (instancePath === '/roles') return new AppError('ROLES_ARRAY_TYPE_REQUIRED')
        if (instancePath === '/features') return new AppError('FEATURES_ARRAY_TYPE_REQUIRED')
        if (instancePath === '/components') return new AppError('COMPONENTS_ARRAY_TYPE_REQUIRED')
        if (instancePath === '/translations')
          return new AppError('TRANSLATIONS_ARRAY_TYPE_REQUIRED')
      }
      throw new Error('Unknown AJV error: ' + JSON.stringify(error, null, 2))
    })
  }
}
