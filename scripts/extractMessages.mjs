#!/usr/bin/env node
/*
 * Walks src/** looking for `t('id', ...)` calls, diffs the ids against
 * src/i18n/messages/en-US.json, and warns about missing or unused ids. When
 * invoked with --write it seeds missing ids using the 3rd-argument default
 * message literal when one is supplied, falling back to the id itself.
 *
 * Patterns detected:
 *   t('foo.bar')
 *   t("foo.bar", { x: 1 })
 *   t('foo.bar', {}, 'Default English copy')
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { readdir, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { argv, exit } from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')
const sourceCatalogPath = resolve(repoRoot, 'src/i18n/messages/en-US.json')

const GLOB_ROOTS = ['src']
const IGNORED_DIRS = new Set(['node_modules', 'dist', '.git', 'playwright-report'])
const TEXT_EXT = /\.(ts|tsx|js|jsx)$/

// Capture id + optional default message. Handles:
//   t('id')
//   t('id', obj)
//   t('id', obj, 'default')
// with single or double quotes; stops at the closing paren.
const CALL_RE =
  /\bt\(\s*(['"])([A-Za-z0-9_.-]+)\1(?:\s*,\s*(?:\{[^}]*\}|[A-Za-z_][A-Za-z0-9_]*)\s*,\s*(['"])((?:\\.|[^\\])*?)\3)?\s*\)/g

const walk = async (dir, out) => {
  const entries = await readdir(dir)
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry)) continue
    const full = resolve(dir, entry)
    const st = await stat(full)
    if (st.isDirectory()) {
      await walk(full, out)
    } else if (TEXT_EXT.test(entry)) {
      out.push(full)
    }
  }
}

const collectCalls = async () => {
  const files = []
  for (const root of GLOB_ROOTS) {
    await walk(resolve(repoRoot, root), files)
  }
  const calls = new Map() // id → first default seen
  for (const file of files) {
    const text = readFileSync(file, 'utf-8')
    for (const match of text.matchAll(CALL_RE)) {
      const id = match[2]
      const defaultMessage = match[4]
      if (!calls.has(id) && defaultMessage) {
        calls.set(id, defaultMessage.replace(/\\(['"])/g, '$1'))
      } else if (!calls.has(id)) {
        calls.set(id, undefined)
      }
    }
  }
  return calls
}

const main = async () => {
  const calls = await collectCalls()
  const catalog = JSON.parse(readFileSync(sourceCatalogPath, 'utf-8'))
  const catalogIds = new Set(Object.keys(catalog))

  const missing = [...calls.keys()].filter((id) => !catalogIds.has(id)).sort()
  const unused = [...catalogIds].filter((id) => !calls.has(id)).sort()

  console.log(`Used ids: ${calls.size}`)
  console.log(`Catalog ids: ${catalogIds.size}`)

  if (missing.length) {
    console.log(`\nMissing from catalog (${missing.length}):`)
    for (const id of missing) {
      const def = calls.get(id)
      console.log(`  - ${id}${def ? `  →  ${JSON.stringify(def)}` : ''}`)
    }
  }
  if (unused.length) {
    console.log(`\nCatalog ids with no usage (${unused.length}):`)
    for (const id of unused) console.log(`  - ${id}`)
  }

  if (argv.includes('--write')) {
    const next = { ...catalog }
    let added = 0
    for (const id of missing) {
      const fallback = calls.get(id) ?? id
      next[id] = fallback
      added += 1
    }
    const ordered = Object.fromEntries(
      Object.keys(next)
        .sort()
        .map((k) => [k, next[k]])
    )
    writeFileSync(sourceCatalogPath, `${JSON.stringify(ordered, null, 2)}\n`, 'utf-8')
    console.log(`\nAdded ${added} entries to ${sourceCatalogPath}`)
  } else if (missing.length) {
    console.log('\nRe-run with --write to add missing ids (using 3rd-arg defaults where present).')
    exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  exit(1)
})
