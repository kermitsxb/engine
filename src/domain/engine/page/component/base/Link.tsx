import type { ConfigError } from '@domain/entities/error/Config'
import type { Icon } from './Icon'
import type { ReactComponent, Base, BaseProps } from './base'

export interface Props extends BaseProps {
  label: string
  href: string
  active?: boolean
  PrefixIcon?: React.FC<BaseProps>
  SuffixIcon?: React.FC<BaseProps>
}

interface Params extends Props {
  label: string
  href: string
  active?: boolean
  prefixIcon?: Icon
  suffixIcon?: Icon
  Component: ReactComponent<Props>
}

export class Link implements Base<Props> {
  constructor(private params: Params) {}

  init = async () => {
    const { prefixIcon, suffixIcon } = this.params
    await Promise.all([prefixIcon?.init(), suffixIcon?.init()])
  }

  render = async () => {
    const { Component, prefixIcon, suffixIcon, ...defaultProps } = this.params
    const PrefixIcon = prefixIcon ? await prefixIcon.render() : undefined
    const SuffixIcon = suffixIcon ? await suffixIcon.render() : undefined
    return (props?: Partial<Props>) => (
      <Component {...{ PrefixIcon, SuffixIcon, ...defaultProps, ...props }} />
    )
  }

  validateConfig = () => {
    const { prefixIcon, suffixIcon } = this.params
    const errors: ConfigError[] = []
    if (prefixIcon) {
      errors.push(...prefixIcon.validateConfig())
    }
    if (suffixIcon) {
      errors.push(...suffixIcon.validateConfig())
    }
    return errors
  }
}
