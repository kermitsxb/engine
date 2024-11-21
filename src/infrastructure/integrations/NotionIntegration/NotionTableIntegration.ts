import type { FilterDto } from '@adapter/spi/dtos/FilterDto'
import type { INotionTableIntegration } from '@adapter/spi/integrations/NotionTableSpi'
import type {
  NotionTablePage,
  NotionTablePageProperties,
  NotionTablePagePropertyValue,
} from '@domain/integrations/NotionTable'
import { Client } from '@notionhq/client'
import type {
  CreatePageParameters,
  PageObjectResponse,
  DatabaseObjectResponse,
  QueryDatabaseParameters,
  RichTextItemResponse,
  PartialUserObjectResponse,
  UserObjectResponse,
  QueryDatabaseResponse,
  PartialDatabaseObjectResponse,
  PartialPageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints'
import { NotionIntegration } from '.'
import { subSeconds, format } from 'date-fns'

export class NotionTableIntegration implements INotionTableIntegration {
  constructor(
    private _api: Client,
    private _database: DatabaseObjectResponse
  ) {}

  get name() {
    return this._database.title.map((title) => title.plain_text).join('')
  }

  create = async (page: NotionTablePageProperties) => {
    const properties = this._preprocessProperties(page)
    const createdPage = await NotionIntegration.retry(
      async () =>
        await this._api.pages.create({
          parent: {
            database_id: this._database.id,
          },
          properties,
        })
    )
    return this._postprocessPage(this._throwIfNotPageObjectResponse(createdPage))
  }

  createMany = async (pages: NotionTablePageProperties[]) => {
    const pagesCreated: Promise<NotionTablePage>[] = []
    for (const page of pages) pagesCreated.push(this.create(page))
    return Promise.all(pagesCreated)
  }

  update = async (id: string, page: NotionTablePageProperties) => {
    const properties = this._preprocessProperties(page)
    const updatedPage = await NotionIntegration.retry(
      async () =>
        await this._api.pages.update({
          page_id: id,
          properties,
        })
    )
    return this._postprocessPage(this._throwIfNotPageObjectResponse(updatedPage))
  }

  retrieve = async (id: string) => {
    const page = await NotionIntegration.retry(
      async () => await this._api.pages.retrieve({ page_id: id })
    )
    return this._postprocessPage(this._throwIfNotPageObjectResponse(page))
  }

  archive = async (id: string) => {
    await NotionIntegration.retry(
      async () =>
        await this._api.pages.update({
          page_id: id,
          archived: true,
        })
    )
  }

  archiveMany = async (ids: string[]) => {
    const pagesArchived: Promise<void>[] = []
    for (const id of ids) pagesArchived.push(this.archive(id))
    return Promise.all(pagesArchived)
  }

  list = async (filter?: FilterDto) => {
    const query: QueryDatabaseParameters = {
      database_id: this._database.id,
    }
    if (filter) {
      query.filter = this._convertFilter(filter)
    }
    let pages: QueryDatabaseResponse['results'] = []
    let cursor: string | undefined = undefined
    do {
      const response = await NotionIntegration.retry(
        async () =>
          await this._api.databases.query({
            ...query,
            start_cursor: cursor,
          })
      )
      pages = pages.concat(response.results)
      cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
    } while (cursor)
    return pages.map((page) => this._postprocessPage(this._throwIfNotPageObjectResponse(page)))
  }

  private _preprocessProperties = (
    properties: NotionTablePageProperties
  ): CreatePageParameters['properties'] => {
    const pageProperties: CreatePageParameters['properties'] = {}
    for (const key in properties) {
      const property = this._database.properties[key]
      if (property) {
        switch (property.type) {
          case 'title':
            pageProperties[key] = {
              type: 'title',
              title: [
                {
                  text: {
                    content: String(properties[key]),
                  },
                },
              ],
            }
            break
        }
      }
    }
    return pageProperties
  }

  private _postprocessPage = (page: PageObjectResponse): NotionTablePage => {
    const properties: NotionTablePageProperties = {}
    for (const key in page.properties) {
      const property = page.properties[key]
      properties[key] = this._getPropertyValue(property)
    }
    return {
      id: page.id,
      properties,
      createdTime: page.created_time,
    }
  }

  private _throwIfNotPageObjectResponse(
    page:
      | PageObjectResponse
      | PartialPageObjectResponse
      | PartialDatabaseObjectResponse
      | DatabaseObjectResponse
  ): PageObjectResponse {
    if (page.object === 'page' && 'properties' in page) {
      return page
    }
    throw new Error('Not a PageObjectResponse')
  }

  private _getPropertyValue = (property: NotionProperty): NotionTablePagePropertyValue => {
    switch (property.type) {
      case 'title':
        return property.title
          .map((title) => {
            if ('text' in title) {
              return title.text.content
            }
            return ''
          })
          .join('')
      case 'checkbox':
        return property.checkbox
      case 'created_by':
        return property.created_by.id
      case 'created_time':
        return property.created_time
      case 'date':
        return property.date?.start || null
      case 'email':
        return property.email
      case 'files':
        return property.files.map((file) => {
          if ('external' in file) {
            return {
              name: file.name,
              url: file.external.url,
            }
          }
          return {
            name: file.name,
            url: file.file.url,
          }
        })
      case 'formula':
        switch (property.formula.type) {
          case 'string':
            return property.formula.string
          case 'number':
            return property.formula.number
          case 'boolean':
            return property.formula.boolean
          case 'date':
            return property.formula.date?.start || null
        }
        break
      case 'last_edited_by':
        return property.last_edited_by.id
      case 'last_edited_time':
        return property.last_edited_time
      case 'multi_select':
        return property.multi_select.map((select) => select.name)
      case 'number':
        return property.number
      case 'people':
        return property.people.map((person) => person.id)
      case 'phone_number':
        return property.phone_number
      case 'relation':
        return property.relation.map((relation) => relation.id)
      case 'rollup':
        switch (property.rollup.type) {
          case 'array':
            return property.rollup.array?.map((item) => this._getPropertyValue(item)) || null
          case 'date':
            return property.rollup.date?.start || null
          case 'number':
            return property.rollup.number || null
        }
        break
      case 'rich_text':
        return property.rich_text
          .map((text) => {
            if ('text' in text) {
              return text.text.content
            }
            return ''
          })
          .join('')
      case 'select':
        return property.select?.name || null
      case 'url':
        return property.url
      case 'status':
        return property.status?.name || null
      case 'button':
        return null
      case 'unique_id':
        return (property.unique_id.prefix ?? '') + property.unique_id.number
      case 'verification':
        return property.verification?.state || null
    }
  }

  // TODO: fix two levels deep : https://developers.notion.com/reference/post-database-query-filter#compound-filter-conditions
  private _convertFilter = (filter: FilterDto): QueryDatabaseParameters['filter'] => {
    if ('and' in filter) {
      return {
        // eslint-disable-next-line
        // @ts-ignore
        and: filter.and.map(this._convertFilter),
      }
    } else if ('or' in filter) {
      return {
        // eslint-disable-next-line
        // @ts-ignore
        or: filter.or.map(this._convertFilter),
      }
    }
    const { operator, field } = filter
    const formatDate = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm:00XXX")
    switch (operator) {
      case 'Is':
        return {
          property: field,
          rich_text: {
            equals: filter.value,
          },
        }
      case 'IsAfterNumberOfSecondsSinceNow':
        if (field === 'created_time') {
          return {
            timestamp: 'created_time',
            created_time: {
              on_or_after: formatDate(subSeconds(new Date(), filter.value)),
            },
          }
        }
        if (field === 'last_edited_time') {
          return {
            timestamp: 'last_edited_time',
            last_edited_time: {
              on_or_after: formatDate(subSeconds(new Date(), filter.value)),
            },
          }
        }
        return {
          property: field,
          date: {
            on_or_after: formatDate(subSeconds(new Date(), filter.value)),
          },
        }
      case 'Equals':
        return {
          property: field,
          number: {
            equals: filter.value,
          },
        }
      case 'IsAnyOf':
        return {
          or: filter.value.map((value) => ({
            property: field,
            multi_select: {
              contains: value,
            },
          })),
        }
      case 'IsFalse':
        return {
          property: field,
          checkbox: {
            equals: false,
          },
        }
      case 'IsTrue':
        return {
          property: field,
          checkbox: {
            equals: true,
          },
        }
    }
  }
}

type NotionProperty =
  | {
      type: 'title'
      title: RichTextItemResponse[]
    }
  | {
      type: 'rich_text'
      rich_text: RichTextItemResponse[]
    }
  | {
      type: 'number'
      number: number | null
    }
  | {
      type: 'select'
      select: { id: string; name: string; color: string } | null
    }
  | {
      type: 'multi_select'
      multi_select: { id: string; name: string; color: string }[]
    }
  | {
      type: 'date'
      date: { start: string; end: string | null } | null
    }
  | {
      type: 'checkbox'
      checkbox: boolean
    }
  | {
      type: 'url'
      url: string | null
    }
  | {
      type: 'email'
      email: string | null
    }
  | {
      type: 'phone_number'
      phone_number: string | null
    }
  | {
      type: 'relation'
      relation: { id: string }[]
    }
  | {
      type: 'formula'
      formula:
        | { type: 'string'; string: string | null }
        | { type: 'number'; number: number | null }
        | { type: 'boolean'; boolean: boolean | null }
        | { type: 'date'; date: { start: string; end: string | null } | null }
    }
  | {
      type: 'rollup'
      rollup: {
        type: 'number' | 'date' | 'array'
        number?: number | null
        date?: { start: string; end: string | null } | null
        array?: NotionProperty[]
      }
    }
  | {
      type: 'people'
      people: (PartialUserObjectResponse | UserObjectResponse)[]
    }
  | {
      type: 'files'
      files: (
        | { name: string; file: { url: string } }
        | { name: string; external: { url: string } }
      )[]
    }
  | {
      type: 'created_time'
      created_time: string
    }
  | {
      type: 'last_edited_time'
      last_edited_time: string
    }
  | {
      type: 'created_by'
      created_by: { id: string; object: string }
    }
  | {
      type: 'last_edited_by'
      last_edited_by: { id: string; object: string }
    }
  | { type: 'status'; status: { name: string; id: string } | null }
  | { type: 'button'; button: { [key: string]: never } }
  | { type: 'unique_id'; unique_id: { prefix: string | null; number: number | null } }
  | {
      type: 'verification'
      verification: {
        state: string
        verified_by:
          | { id: string }
          | {
              id: string
              object: string
            }
          | {
              person: { email?: string | undefined }
              id: string
              type?: 'person' | undefined
              name?: string | null | undefined
              avatar_url?: string | null | undefined
              object?: 'user' | undefined
            }
          | null
        date: {
          start: string
          end: string | null
        } | null
      } | null
    }
