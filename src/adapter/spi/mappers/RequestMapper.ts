import type { GetDto, PostDto } from '../dtos/RequestDto'
import { Get } from '@domain/entities/request/Get'
import { Post } from '@domain/entities/request/Post'

export class RequestMapper {
  static toGetService = (dto: GetDto): Get => {
    return new Get(dto)
  }

  static toGetDto = (service: Get): GetDto => {
    return service
  }

  static toPostService = (dto: PostDto): Post => {
    return new Post(dto)
  }

  static toPostDto = (service: Post): PostDto => {
    return service
  }
}
