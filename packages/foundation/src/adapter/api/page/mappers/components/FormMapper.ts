import { FormDto } from '@adapter/api/page/dtos/components/FormDto'
import { Form } from '@domain/entities/page/components/Form'
import { IUISpi } from '@domain/spi/IUISpi'
import { InputMapper } from './InputMapper'
import { Table } from '@domain/entities/table/Table'

export class FormMapper {
  static toEntity(formDto: FormDto, ui: IUISpi, tables: Table[]): Form {
    const { table, inputs, submit, recordIdToUpdate } = formDto
    return new Form(
      table,
      InputMapper.toEntities(inputs, ui, table, tables),
      submit,
      ui.FormUI,
      recordIdToUpdate
    )
  }

  static toDto(form: Form): FormDto {
    const { tableName, inputs, submit, recordIdToUpdate } = form
    return {
      type: 'form',
      table: tableName,
      inputs: InputMapper.toDtos(inputs),
      submit,
      recordIdToUpdate,
    }
  }

  static toEntities(formDtos: FormDto[], ui: IUISpi, tables: Table[]): Form[] {
    return formDtos.map((formDto) => this.toEntity(formDto, ui, tables))
  }

  static toDtos(forms: Form[]): FormDto[] {
    return forms.map((form) => this.toDto(form))
  }
}
