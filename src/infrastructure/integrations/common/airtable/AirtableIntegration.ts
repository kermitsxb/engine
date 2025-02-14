import type { IAirtableIntegration } from '/adapter/spi/integrations/AirtableSpi'
import { AirtableTableIntegration } from './AirtableTableIntegration'
import type { AirtableConfig } from '/domain/integrations/Airtable'
import Airtable from 'airtable'
import axios, { type AxiosInstance } from 'axios'
import type { AirtableTableRecordFields } from '/domain/integrations/Airtable/AirtableTableRecord'

export class AirtableIntegration implements IAirtableIntegration {
  private _airtable?: {
    base: Airtable.Base
    meta: AxiosInstance
  }

  constructor(private _config?: AirtableConfig) {}

  getConfig = (): AirtableConfig => {
    if (!this._config) {
      throw new Error('Airtable config not set')
    }
    return this._config
  }

  getTable = async <T extends AirtableTableRecordFields = AirtableTableRecordFields>(
    id: string
  ) => {
    const api = this._api()
    const tablesSchema: AirtableBaseSchema = await api.meta.get('/').then((res) => res.data)
    const schema = tablesSchema.tables.find((table) => table.id === id || table.name === id)
    if (!schema) {
      throw new Error(`Table with id "${id}" not found`)
    }
    return new AirtableTableIntegration<T>(api.base(id), schema)
  }

  private _api = (): {
    base: Airtable.Base
    meta: AxiosInstance
  } => {
    if (!this._airtable) {
      const { apiKey, baseId } = this.getConfig()
      this._airtable = {
        base: new Airtable({ apiKey }).base(baseId),
        meta: axios.create({
          baseURL: `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
          headers: {
            Authorization: 'Bearer ' + apiKey,
            'Content-Type': 'application/json',
          },
        }),
      }
    }
    return this._airtable
  }
}

interface AirtableBaseField {
  id: string
  name: string
  description: string
}

interface AirtableAiTextField extends AirtableBaseField {
  type: 'aiText'
  option: {
    prompt?: string[]
    referencedFieldIds?: string[]
  }
}

interface AirtableAttachmentField extends AirtableBaseField {
  type: 'multipleAttachments'
  options: {
    isReversed: boolean
  }
}

interface AirtableAutoNumberField extends AirtableBaseField {
  type: 'autoNumber'
}

interface AirtableBarcodeField extends AirtableBaseField {
  type: 'barcode'
}

interface AirtableButtonField extends AirtableBaseField {
  type: 'button'
}

interface AirtableCheckboxField extends AirtableBaseField {
  type: 'checkbox'
  options: {
    color:
      | 'greenBright'
      | 'tealBright'
      | 'cyanBright'
      | 'blueBright'
      | 'purpleBright'
      | 'pinkBright'
      | 'redBright'
      | 'orangeBright'
      | 'yellowBright'
      | 'grayBright'
    icon: 'check' | 'xCheckbox' | 'star' | 'heart' | 'thumbsUp' | 'flag' | 'dot'
  }
}

interface AirtableCollaboratorField extends AirtableBaseField {
  type: 'singleCollaborator'
  options?: {}
}

interface AirtableCountField extends AirtableBaseField {
  type: 'count'
  options: {
    isValid: boolean
    recordLinkFieldId?: string
  }
}

interface AirtableCreatedByField extends AirtableBaseField {
  type: 'createdBy'
}

interface AirtableCreatedTimeField extends AirtableBaseField {
  type: 'createdTime'
  options: {
    result?: AirtableDateField | AirtableDateTimeField
  }
}

interface AirtableCurrencyField extends AirtableBaseField {
  type: 'currency'
  options: {
    symbol: string
    precision: number
  }
}

interface AirtableDateField extends AirtableBaseField {
  type: 'date'
  options: {
    dateFormat: {
      format?: 'l' | 'LL' | 'M/D/YYYY' | 'D/M/YYYY' | 'YYYY-MM-DD'
      name: 'local' | 'friendly' | 'us' | 'european' | 'iso'
    }
  }
}

interface AirtableDateTimeField extends AirtableBaseField {
  type: 'dateTime'
  options: {
    timeZone: 'client' | 'utc'
    dateFormat: {
      format?: 'l' | 'LL' | 'M/D/YYYY' | 'D/M/YYYY' | 'YYYY-MM-DD'
      name: 'local' | 'friendly' | 'us' | 'european' | 'iso'
    }
    timeFormat: {
      name: '12hour' | '24hour'
      format?: 'h:mma' | 'HH:mm'
    }
  }
}

interface AirtableDurationField extends AirtableBaseField {
  type: 'duration'
  options: {
    durationFormat: 'h:mm' | 'h:mm:ss' | 'h:mm:ss.S' | 'h:mm:ss.SS' | 'h:mm:ss.SSS'
  }
}

interface AirtableEmailField extends AirtableBaseField {
  type: 'email'
}

interface AirtableFormulaField extends AirtableBaseField {
  type: 'formula'
  options: {
    formula: string
    isValid: boolean
    referencedFieldIds?: string[]
    result?: AirtableField
  }
}

interface AirtableLastModifiedTimeField extends AirtableBaseField {
  type: 'lastModifiedTime'
  options: {
    isValid: boolean
    referencedFieldIds?: string[]
    result?: AirtableDateField | AirtableDateTimeField
  }
}

interface AirtableMultipleRecordLinksField extends AirtableBaseField {
  type: 'multipleRecordLinks'
  options: {
    isReversed: boolean
    linkedTableId: string
    prefersSingleRecordLink: boolean
    inverseLinkFieldId?: string
    viewIdForRecordSelection?: string
  }
}

interface AirtableLongTextField extends AirtableBaseField {
  type: 'multilineText'
}

interface AirtableLookupField extends AirtableBaseField {
  type: 'lookup'
  options: {
    fieldIdInLinkedTable?: string
    recordLinkFieldId?: string
    isValid: boolean
    result: AirtableField
  }
}

interface AirtableMultipleCollaboratorField extends AirtableBaseField {
  type: 'multipleCollaborators'
  options: {}
}

interface AirtableMultipleSelectField extends AirtableBaseField {
  type: 'multipleSelects'
  options: {
    choices: {
      id: string
      name: string
      color:
        | 'blueLight2'
        | 'cyanLight2'
        | 'tealLight2'
        | 'greenLight2'
        | 'yellowLight2'
        | 'orangeLight2'
        | 'redLight2'
        | 'pinkLight2'
        | 'purpleLight2'
        | 'grayLight2'
        | 'blueLight1'
        | 'cyanLight1'
        | 'tealLight1'
        | 'greenLight1'
        | 'yellowLight1'
        | 'orangeLight1'
        | 'redLight1'
        | 'pinkLight1'
        | 'purpleLight1'
        | 'grayLight1'
        | 'blueBright'
        | 'cyanBright'
        | 'tealBright'
        | 'greenBright'
        | 'yellowBright'
        | 'orangeBright'
        | 'redBright'
        | 'pinkBright'
        | 'purpleBright'
        | 'grayBright'
        | 'blueDark1'
        | 'cyanDark1'
        | 'tealDark1'
        | 'greenDark1'
        | 'yellowDark1'
        | 'orangeDark1'
        | 'redDark1'
        | 'pinkDark1'
        | 'purpleDark1'
        | 'grayDark1'
    }[]
  }
}

interface AirtableNumberField extends AirtableBaseField {
  type: 'number'
  options: {
    precision: number
  }
}

interface AirtablePercentField extends AirtableBaseField {
  type: 'percent'
  options: {
    precision: number
  }
}

interface AirtablePhoneField extends AirtableBaseField {
  type: 'phoneNumber'
}

interface AirtableRatingField extends AirtableBaseField {
  type: 'rating'
  options: {
    color:
      | 'yellowBright'
      | 'orangeBright'
      | 'redBright'
      | 'pinkBright'
      | 'purpleBright'
      | 'blueBright'
      | 'cyanBright'
      | 'tealBright'
      | 'greenBright'
      | 'grayBright'
    icon: 'star' | 'heart' | 'thumbsUp' | 'flag' | 'dot'
    max: number
  }
}

interface AirtableRichTextField extends AirtableBaseField {
  type: 'richText'
}

interface AirtableRollupField extends AirtableBaseField {
  type: 'rollup'
  options: {
    fieldIdInLinkedTable?: string
    recordLinkFieldId?: string
    result?: AirtableField
    isValid?: boolean
    referencedFieldIds?: string[]
  }
}

interface AirtableSingleLineTextField extends AirtableBaseField {
  type: 'singleLineText'
}

interface AirtableSingleSelectField extends AirtableBaseField {
  type: 'singleSelect'
  options: {
    choices: {
      id: string
      name: string
      color:
        | 'blueLight2'
        | 'cyanLight2'
        | 'tealLight2'
        | 'greenLight2'
        | 'yellowLight2'
        | 'orangeLight2'
        | 'redLight2'
        | 'pinkLight2'
        | 'purpleLight2'
        | 'grayLight2'
        | 'blueLight1'
        | 'cyanLight1'
        | 'tealLight1'
        | 'greenLight1'
        | 'yellowLight1'
        | 'orangeLight1'
        | 'redLight1'
        | 'pinkLight1'
        | 'purpleLight1'
        | 'grayLight1'
        | 'blueBright'
        | 'cyanBright'
        | 'tealBright'
        | 'greenBright'
        | 'yellowBright'
        | 'orangeBright'
        | 'redBright'
        | 'pinkBright'
        | 'purpleBright'
        | 'grayBright'
        | 'blueDark1'
        | 'cyanDark1'
        | 'tealDark1'
        | 'greenDark1'
        | 'yellowDark1'
        | 'orangeDark1'
        | 'redDark1'
        | 'pinkDark1'
        | 'purpleDark1'
        | 'grayDark1'
    }[]
  }
}

interface AirtableUrlField extends AirtableBaseField {
  type: 'url'
}

export type AirtableField =
  | AirtableAiTextField
  | AirtableAttachmentField
  | AirtableAutoNumberField
  | AirtableBarcodeField
  | AirtableButtonField
  | AirtableCheckboxField
  | AirtableCollaboratorField
  | AirtableCountField
  | AirtableCreatedByField
  | AirtableCreatedTimeField
  | AirtableCurrencyField
  | AirtableDateField
  | AirtableDateTimeField
  | AirtableDurationField
  | AirtableEmailField
  | AirtableFormulaField
  | AirtableLastModifiedTimeField
  | AirtableMultipleRecordLinksField
  | AirtableLongTextField
  | AirtableLookupField
  | AirtableMultipleCollaboratorField
  | AirtableMultipleSelectField
  | AirtableNumberField
  | AirtablePercentField
  | AirtablePhoneField
  | AirtableRatingField
  | AirtableRichTextField
  | AirtableRollupField
  | AirtableSingleLineTextField
  | AirtableSingleSelectField
  | AirtableUrlField

export interface AirtableBaseSchemaTable {
  id: string
  name: string
  description: string
  fields: AirtableField[]
}

export interface AirtableBaseSchema {
  tables: AirtableBaseSchemaTable[]
}
