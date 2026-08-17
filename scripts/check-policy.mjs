#!/usr/bin/env node
/** Validate a policy YAML file: shape + every rule regex compiles. */
import { readFile } from 'node:fs/promises'
import { loadRules, DEFAULT_RULES } from '../policy.js'

const target = process.argv[2]
let rules = DEFAULT_RULES
if (target) {
  const raw = await readFile(target, 'utf8')
  rules = loadRules(raw)
}
console.log('rules: ' + rules.length)
let bad = 0
for (const r of rules) {
  try { new RegExp(r.match, 'iu'); console.log('ok   ' + r.match) }
  catch { bad++; console.log('BAD  ' + r.match) }
}
process.exit(bad === 0 ? 0 : 1)
