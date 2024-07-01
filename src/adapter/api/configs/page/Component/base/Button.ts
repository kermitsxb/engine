import type { Type, Variant } from '@domain/engine/page/component/base/Button'
import type { Method } from '@domain/entities/request'
import type { Base } from './Base'

export interface Config extends Base {
  label: string
  href?: string
  type?: Type
  variant?: Variant
  action?: string
  method?: Method
  onSuccess?:
    | {
        redirect: string
      }
    | {
        notification: {
          message: string
          type: 'success' | 'error'
        }
      }
}

export interface Button extends Config {
  component: 'Button'
}
