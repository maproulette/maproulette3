import {
  type RenderHookOptions,
  type RenderOptions,
  render as rtlRender,
  renderHook as rtlRenderHook,
} from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { IntlProvider } from '@/i18n'

const Wrapper = ({ children }: { children: ReactNode }) => <IntlProvider>{children}</IntlProvider>

export const render = (ui: ReactElement, options?: RenderOptions) =>
  rtlRender(ui, { wrapper: Wrapper, ...options })

export const renderHook = <Result, Props>(
  callback: (props: Props) => Result,
  options?: RenderHookOptions<Props>
) => rtlRenderHook(callback, { wrapper: Wrapper, ...options })

export * from '@testing-library/react'
