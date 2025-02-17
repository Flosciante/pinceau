import type { ASTNode } from 'ast-types'
import { astTypes, parseAst, printAst, propStringToAst, visitAst } from '../../utils/ast'

export interface PropOptions {
  type?: any
  required?: boolean
  default?: any
  validator?: (value: unknown) => boolean
}

/**
 * Takes variants object and turns it into a `const` inside `<script setup>`
 */
export function transformVariants(code = '', variants: any = {}, isTs: boolean): string {
  const variantsProps = resolveVariantsProps(variants, isTs)

  code = code.replace(/(...)?\$variantsProps(,)?/mg, '')

  const sanitizedVariants = Object.entries(variants || {}).reduce(
    (acc, [key, variant]: any) => {
      delete variant.options
      acc[key] = variant
      return acc
    },
    {},
  )

  code += `\nconst __$pVariants = ${JSON.stringify(sanitizedVariants)}\n`

  if (variantsProps) { code = pushVariantsProps(code, variantsProps) }

  return code
}

/**
 * Push variants object to components props.
 *
 * Only work with `defineProps()`.
 */
export function pushVariantsProps(code: string, variantsProps: any) {
  const scriptAst = parseAst(code)

  let propsAst = propStringToAst(JSON.stringify(variantsProps))

  propsAst = castVariantsPropsAst(propsAst)

  // Push to defineProps
  visitAst(
    scriptAst,
    {
      visitCallExpression(path) {
        if (path?.value?.callee?.name === 'defineProps') {
          path.value.arguments[0].properties.push(
            astTypes.builders.spreadElement(propsAst),
          )
        }
        return this.traverse(path)
      },
    },
  )

  return printAst(scriptAst).code
}

/**
 * Resolve a Vue component props object from css() variants.
 */
export function resolveVariantsProps(variants, isTs: boolean) {
  const props = {}

  Object.entries(variants).forEach(
    ([key, variant]: [string, any]) => {
      const prop: any = {
        required: false,
      }

      const isBooleanVariant = Object.keys(variant).some(key => (key === 'true' || key === 'false'))
      if (isBooleanVariant) {
        prop.type = ` [Boolean, Object]${isTs ? 'as PropType<boolean | ({ [key in MediaQueriesKeys]: boolean }) | ({ [key: string]: boolean })>' : ''}`
        prop.default = false
      }
      else {
        const possibleValues = `\'${Object.keys(variant).join('\' | \'')}\'`
        prop.type = ` [String, Object]${isTs ? ` as PropType<${possibleValues} | ({ [key in MediaQueriesKeys]: ${possibleValues} }) | ({ [key: string]: ${possibleValues} })>` : ''}`
        prop.default = undefined
      }

      if (variant?.options) {
        const options = variant.options
        if (options.default) { prop.default = options.default }
        if (options.required) { prop.required = options.required }
        if (options.type) { prop.type = options.type }
        if (options.validator) { prop.validator = options.validator.toString() }
      }

      props[key] = prop
    },
  )

  return props
}

export function castVariantsPropsAst(ast: ASTNode) {
  // Cast stringified values
  visitAst(
    ast,
    {
      visitObjectProperty(path) {
        // Cast `type` string
        if (path.value?.key?.value === 'type') {
          path.value.value = propStringToAst(path.value.value.value)
        }
        // Cast `validator` string
        if (path.value?.key?.value === 'validator') {
          path.value.value = propStringToAst(path.value.value.value)
        }
        return this.traverse(path)
      },
    },
  )
  return ast
}
