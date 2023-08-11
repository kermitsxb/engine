import { JSONSchemaType } from 'ajv'

export interface BaseInputDto {
  field: string
  label?: string
}

export const BaseInputDtoSchema: JSONSchemaType<BaseInputDto> = {
  type: 'object',
  properties: {
    field: { type: 'string' },
    label: { type: 'string', nullable: true },
  },
  required: ['field'],
  additionalProperties: false,
}
