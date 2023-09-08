import { TitleComponentDto } from '@adapter/api/page/dtos/components/TitleComponentDto'
import { TitleComponent } from '@domain/entities/page/components/TitleComponent'
import { IUISpi } from '@domain/spi/IUISpi'

export class TitleMapper {
  static toEntity(titleDto: TitleComponentDto, ui: IUISpi): TitleComponent {
    return new TitleComponent(titleDto.text, ui.TitleUI, titleDto.size)
  }

  static toDto(title: TitleComponent): TitleComponentDto {
    return {
      type: 'title',
      text: title.text,
      size: title.size,
    }
  }

  static toEntities(titleDtos: TitleComponentDto[], ui: IUISpi): TitleComponent[] {
    return titleDtos.map((titleDto) => this.toEntity(titleDto, ui))
  }

  static toDtos(titles: TitleComponent[]): TitleComponentDto[] {
    return titles.map((title) => this.toDto(title))
  }
}
