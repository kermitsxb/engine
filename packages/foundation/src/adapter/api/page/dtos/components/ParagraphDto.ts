import { JSONSchemaType } from 'ajv'

export interface ParagraphDto {
  type: 'paragraph'
  text: string
}

export const ParagraphDtoSchema: JSONSchemaType<ParagraphDto> = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['paragraph'] },
    text: { type: 'string' },
  },
  required: ['type', 'text'],
  additionalProperties: false,
}
