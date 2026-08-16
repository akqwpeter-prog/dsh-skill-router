/**
 * dsh-skill-router: pre-step skill router.
 *
 * Matches the latest user message against user-editable rules
 * (~/.dsh/skill-router.yaml, bundled defaults in policy.js). High-
 * confidence hits pour the matched skill bodies into the step as
 * skill-invocation user messages (reusing renderSkillContent, so the
 * catalog's already-loaded rule applies). No hit = zero intervention.
 * Each skill pours at most once per session.
 *
 * @module dsh-skill-router
 */

import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { isModelInvocable, renderSkillContent } from '@deepseek-ai/dsh-skill'
import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { DEFAULT_RULES, loadRules, matchRules } from './policy.js'

/** Cordis plugin name. */
export const name = 'dsh-skill-router'
/** Service required for scoped skill lookups. */
export const inject = ['skills']

/** sessionId -> Set of skill names already poured. */
const poured = new Map()

/** Latest user-authored text among the step's pending messages. */
function latestUserText(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.source && m.source.kind !== 'user') continue
    const parts = Array.isArray(m.content) ? m.content : []
    const text = parts
      .filter((p) => p && p.type === 'text' && typeof p.text === 'string')
      .map((p) => p.text)
      .join('\n')
      .trim()
    if (text) return text
  }
  return undefined
}

/**
 * Register the pre-step router and load the policy once.
 */
export async function apply(ctx) {
  const policyPath = join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'skill-router.yaml')
  let rules = DEFAULT_RULES
  try {
    const raw = await readFile(policyPath, 'utf8')
    rules = loadRules(raw)
    console.warn('[dsh-skill-router] loaded policy from ' + policyPath)
  } catch {
    // Missing or unparsable file: keep bundled defaults. Broken YAML
    // should never break the session; the user's own file is their own.
  }

  ctx.on('agent/pre-step', async ({ agent, messages, signal }, next) => {
    const decision = await next()
    if (decision.kind === 'reject') return decision
    const text = latestUserText(messages)
    if (text === undefined) return decision
    const names = matchRules(rules, text)
    if (names.length === 0) return decision
    signal.throwIfAborted()
    const done = poured.get(agent.id) ?? new Set()
    const additions = []
    for (const skillName of names) {
      if (done.has(skillName)) continue
      const skill = await ctx.skills.get(skillName, {
        cwd: agent.session.header.cwd,
        signal,
        scope: agent,
      })
      if (skill === undefined || !isModelInvocable(skill)) continue
      done.add(skillName)
      additions.push(createUserMessage({
        content: [{ type: 'text', text: renderSkillContent(skill) }],
        source: { kind: 'skill-invocation', name: skillName, form: 'instructions' },
      }))
    }
    poured.set(agent.id, done)
    if (additions.length === 0) return decision
    return { kind: 'enter', messages: [...decision.messages, ...additions] }
  })
}

