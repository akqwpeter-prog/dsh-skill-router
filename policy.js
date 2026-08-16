/**
 * Pure rule matching for dsh-skill-router. Only runtime dep: yaml.
 * Rules are user-editable data: ~/.dsh/skill-router.yaml overrides the
 * bundled defaults below (same shape: rules: [{ match, pour }]).
 */
import { parse as parseYaml } from 'yaml'

/** Bundled default rules, ordered by precision: first match wins. */
export const DEFAULT_RULES = [
  // URL-path routing first: deterministic, highest precision.
  { match: '(feishu\\.cn|larksuite\\.com|doubao\\.com)/docx/', pour: ['lark-doc'] },
  { match: '(feishu\\.cn|larksuite\\.com|doubao\\.com)/wiki/', pour: ['lark-wiki'] },
  { match: '(feishu\\.cn|larksuite\\.com|doubao\\.com)/drive/', pour: ['lark-drive'] },
  { match: '(feishu\\.cn|larksuite\\.com|doubao\\.com)/sheets/', pour: ['lark-sheets'] },
  { match: '(feishu\\.cn|larksuite\\.com|doubao\\.com)/base/', pour: ['lark-base'] },
  { match: '(feishu\\.cn|larksuite\\.com|doubao\\.com)/slides/', pour: ['lark-slides'] },
  { match: '(feishu\\.cn|larksuite\\.com|doubao\\.com)/mindnotes/', pour: ['lark-markdown'] },
  // Media skills.
  { match: '(生成|画|做|创作|来一张)[^。\\n]{0,12}(图|插画|海报|banner|封面|头像|背景)|poster|banner|image\\s+gen', pour: ['media-tools'] },
  { match: '(看|读|检查|分析|描述|识别)[^。\\n]{0,10}(图|截图|界面|logo|水印|照片|设计稿)|视觉检查|ui\\s?检查', pour: ['vision-review'] },
  // Delegation to external agent CLIs.
  { match: '派[^。\\n]{0,6}(codex|claude|trae|opencode|gemini|cursor|kimi|qwen|copilot|workbuddy|grok)|让[^。\\n]{0,8}(codex|claude\\s?code|trae|opencode|gemini)[^。\\n]{0,6}(干|做|写|查|分析)', pour: ['conductor'] },
  // Workflow skills compose atomic ones: try these before atomics.
  { match: '会议纪要.{0,8}(周报|总结|整理)|整理.{0,4}会议|会议周报|meeting.{0,10}summary', pour: ['lark-workflow-meeting-summary'] },
  { match: '((今天|本周|明天|近期).{0,6}(安排|日程|待办|计划))|((安排|日程|待办).{0,6}(今天|本周|明天))', pour: ['lark-workflow-standup-report'] },
  // Lark atomics.
  { match: '审批(待办|实例|申请|流程|定义|单)?', pour: ['lark-approval'] },
  { match: '(发|send)[^。\\n]{0,6}(消息|信息)|聊天记录|群聊', pour: ['lark-im'] },
  { match: '(发|写|查|收|看)[^。\\n]{0,6}(邮件|email)|收件箱|草稿', pour: ['lark-mail'] },
  { match: '日历|日程|会议室|订会|安排会议', pour: ['lark-calendar'] },
  { match: '已结束.{0,6}会议|历史会议|会议.{0,8}(逐字稿|纪要|记录)', pour: ['lark-vc'] },
  { match: '多维表格|bitable', pour: ['lark-base'] },
  { match: '电子表格|excel', pour: ['lark-sheets'] },
  { match: 'okr|目标与关键结果', pour: ['lark-okr'] },
]

/** Parse user YAML policy: { rules: [{ match, pour }] }. */
export function loadRules(rawYaml) {
  const doc = parseYaml(rawYaml)
  if (!doc || typeof doc !== 'object' || !Array.isArray(doc.rules)) {
    throw new Error('skill-router policy: expected { rules: [...] }')
  }
  return doc.rules
    .filter((r) => r && typeof r.match === 'string' && Array.isArray(r.pour))
    .map((r) => ({ match: r.match, pour: r.pour.filter((n) => typeof n === 'string') }))
}

/** Regex metacharacters, escaped per character (no regex, no backrefs). */
const RE_CHARS = '.*+?^$' + '{' + '}()[]|' + '\\'

/** Escape a string for use as a regex body. */
export function escapeRegex(s) {
  let out = ''
  for (const ch of s) out += RE_CHARS.includes(ch) ? '\\' + ch : ch
  return out
}

/**
 * Secondary signal: each skill's `whenToUse` frontmatter becomes a literal
 * trigger rule appended after YAML rules (user rules win). Long prose
 * values never match literally — authors should write short trigger
 * phrases; skill-bartender's taste test rewrites prose into them.
 */
export function rulesFromSummaries(summaries) {
  const out = []
  for (const s of summaries) {
    if (!s || typeof s.whenToUse !== 'string') continue
    const t = s.whenToUse.trim()
    if (t.length === 0 || t.length > 80) continue
    out.push({ match: escapeRegex(t), pour: [s.name] })
  }
  return out
}

const compiled = new Map()

/** First rule whose regex matches wins; empty array = no pour (zero-touch). */
export function matchRules(rules, text) {
  for (const rule of rules) {
    let re = compiled.get(rule.match)
    if (re === undefined) {
      try { re = new RegExp(rule.match, 'iu') } catch { continue }
      compiled.set(rule.match, re)
    }
    if (re.test(text)) return rule.pour
  }
  return []
}

