import type { Server } from '@domain/services/Server'
import type { Base } from '../base'
import type { Component } from './component'
import type { Logger } from '@domain/services/Logger'
import type { Head } from './head'
import { Html as HtmlResponse } from '@domain/entities/response/Html'
import type { Ui } from '@domain/services/Ui'
import type { HtmlProps } from './component/base/Html'
import type { ReactComponent } from './component/base/base'

interface Params {
  name: string
  path: string
  head: Head
  body: Component[]
  server: Server
  logger: Logger
  ui: Ui
  Html: ReactComponent<HtmlProps>
}

export class Page implements Base {
  constructor(private params: Params) {}

  init = async () => {
    const { server, body } = this.params
    if (this.path === '/404') {
      await server.notFound(this.get)
    } else {
      await Promise.all(body.map((component) => component.init()))
      await server.get(this.path, this.get)
    }
  }

  validateConfig = async () => {
    const { body } = this.params
    return Promise.all(body.flatMap((component) => component.validateConfig()))
  }

  get name() {
    return this.params.name
  }

  get path() {
    return this.params.path
  }

  get = async () => {
    return new HtmlResponse(await this.html())
  }

  html = async () => {
    const { ui } = this.params
    return ui.renderToHtml(await this.render())
  }

  render = async () => {
    const { body, head } = this.params
    const { Html } = this.params
    const components = await Promise.all(body.map((component) => component.render()))
    return (
      <Html
        head={head ? head.render() : null}
        body={components.map((Component, index) => (
          <Component key={index} />
        ))}
      />
    )
  }
}
