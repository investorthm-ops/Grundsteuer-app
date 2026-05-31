import { resolve } from 'path'
import { fileURLToPath } from 'url'

const srcDir = resolve(fileURLToPath(import.meta.url), '../../..')

export function resolve(specifier, parentURL, defaultResolve) {
  if (specifier.startsWith('@/')) {
    const newSpec = new URL(specifier.slice(2), srcDir + '/').href
    return defaultResolve(newSpec, parentURL, defaultResolve)
  }
  return defaultResolve(specifier, parentURL, defaultResolve)
}
