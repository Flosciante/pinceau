import { computed, watch } from 'vue'
import type { TokensFunction } from '../types'
import { resolveCssProperty, stringify, transformStateToDeclaration } from './utils'

export function usePinceauStylesheet(state: any, $tokens: TokensFunction, appId?: string) {
  const declaration = computed(() => transformStateToDeclaration(state.variantsState, state.propsState, state.computedStylesState))

  const getStylesheetContent = () => stringify(declaration.value, (property: any, value: any, style: any, selectors: any) => resolveCssProperty(property, value, style, selectors, $tokens))

  const updateStylesheet = () => {
    // Only update stylesheet on client-side
    // SSR Rendering occurs in `app:rendered` hook, or via `getStylesheetContent`
    const global = globalThis || window

    if (global && global.document) {
      const doc = global.document
      let style = doc.querySelector(`style#pinceau${appId ? `-${appId}` : ''}`)
      if (!style) {
        const styleTag = doc.createElement('style')
        styleTag.id = `pinceau${appId ? `-${appId}` : ''}`
        styleTag.type = 'text/css'
        style = styleTag
      }

      const content = getStylesheetContent()

      if (!content) {
        style.remove()
        return
      }

      if (content !== style.textContent) {
        style.textContent = content
        doc.head.appendChild(style)
      }
    }
  }

  watch(declaration, () => updateStylesheet(), { immediate: true })

  return {
    updateStylesheet,
    getStylesheetContent,
  }
}
