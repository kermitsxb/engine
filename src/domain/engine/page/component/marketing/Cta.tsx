import type { ConfigError } from '@domain/entities/error/Config'
import type { Button } from '../base/Button'
import type { Paragraph } from '../base/Paragraph'
import type { Title } from '../base/Title'
import type { ReactComponent, Base, BaseProps } from '../base/base'

export interface Props extends BaseProps {
  Title: React.FC
  Paragraph: React.FC
  Buttons: React.FC[]
}

interface Params {
  title: Title
  paragraph: Paragraph
  buttons: Button[]
  Component: ReactComponent<Props>
}

export class Cta implements Base<Props> {
  constructor(private params: Params) {}

  init = async () => {
    const { title, paragraph, buttons } = this.params
    await Promise.all([title.init(), paragraph.init(), ...buttons.map((button) => button.init())])
  }

  render = async () => {
    const { Component, title, paragraph, buttons } = this.params
    const Title = await title.render()
    const Paragraph = await paragraph.render()
    const Buttons = await Promise.all(buttons.map((button) => button.render()))
    return (props?: Partial<Props>) => <Component {...{ Title, Paragraph, Buttons, ...props }} />
  }

  validateConfig = () => {
    const { title, paragraph, buttons } = this.params
    const errors: ConfigError[] = []
    errors.push(...title.validateConfig())
    errors.push(...paragraph.validateConfig())
    buttons.forEach((button) => {
      errors.push(...button.validateConfig())
    })
    return errors
  }
}
