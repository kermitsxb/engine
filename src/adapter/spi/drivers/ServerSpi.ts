import type { GetRequest } from '/domain/entities/Request/Get'
import type { PostRequest } from '/domain/entities/Request/Post'
import type { Response } from '/domain/entities/Response'
import type { IServerSpi } from '/domain/services/Server'
import type { DeleteDto, GetDto, PatchDto, PostDto, RequestDto } from '../dtos/RequestDto'
import { RequestMapper } from '../mappers/RequestMapper'
import type { PatchRequest } from '/domain/entities/Request/Patch'
import type { DeleteRequest } from '/domain/entities/Request/Delete'
import type { Request } from '/domain/entities/Request'

export interface IServerDriver {
  start(): Promise<number>
  stop(): Promise<void>
  get(path: string, handler: (request: GetDto) => Promise<Response>): Promise<void>
  post(path: string, handler: (request: PostDto) => Promise<Response>): Promise<void>
  patch(path: string, handler: (request: PatchDto) => Promise<Response>): Promise<void>
  delete(path: string, handler: (request: DeleteDto) => Promise<Response>): Promise<void>
  notFound(handler: (request: RequestDto) => Promise<Response>): Promise<void>
  afterAllRoutes(): Promise<void>
}

export class ServerSpi implements IServerSpi {
  constructor(private _driver: IServerDriver) {}

  get = async (path: string, handler: (request: GetRequest) => Promise<Response>) => {
    await this._driver.get(path, async (getDto) => {
      const request = RequestMapper.toGetService(getDto)
      return handler(request)
    })
  }

  post = async (path: string, handler: (request: PostRequest) => Promise<Response>) => {
    await this._driver.post(path, async (postDto) => {
      const request = RequestMapper.toPostService(postDto)
      return handler(request)
    })
  }

  patch = async (path: string, handler: (request: PatchRequest) => Promise<Response>) => {
    await this._driver.patch(path, async (patchDto) => {
      const request = RequestMapper.toPatchService(patchDto)
      return handler(request)
    })
  }

  delete = async (path: string, handler: (request: DeleteRequest) => Promise<Response>) => {
    await this._driver.delete(path, async (deleteDto) => {
      const request = RequestMapper.toDeleteService(deleteDto)
      return handler(request)
    })
  }

  notFound = async (handler: (request: Request) => Promise<Response>) => {
    await this._driver.notFound(async (requestDto) => {
      const request = RequestMapper.toService(requestDto)
      return handler(request)
    })
  }

  afterAllRoutes = async () => {
    await this._driver.afterAllRoutes()
  }

  start = async () => {
    return this._driver.start()
  }

  stop = async () => {
    await this._driver.stop()
  }
}
