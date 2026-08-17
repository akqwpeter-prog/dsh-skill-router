import { DEFAULT_RULES, loadRules, matchRules, escapeRegex, rulesFromSummaries } from '../policy.js'

let pass = 0, fail = 0
function check(label, cond) {
  if (cond) { pass++; console.log('PASS ' + label) } else { fail++; console.log('FAIL ' + label) }
}

const rules = loadRules('rules:\n  - match: "图"\n    pour: [media-tools]\n')
check('loadRules parses yaml', rules.length === 1 && rules[0].pour[0] === 'media-tools')

let threw = false
try { loadRules('nope: 1') } catch { threw = true }
check('loadRules rejects wrong shape', threw)

check('first match wins', matchRules(DEFAULT_RULES, '帮我生成一张海报')[0] === 'media-tools')
check('no match returns empty', matchRules(DEFAULT_RULES, '写个排序算法').length === 0)
check('url routing', matchRules(DEFAULT_RULES, '编辑 https://a.feishu.cn/docx/x')[0] === 'lark-doc')
check('workflow before atomic', matchRules(DEFAULT_RULES, '整理本周会议纪要成周报')[0] === 'lark-workflow-meeting-summary')
check('mail not im', matchRules(DEFAULT_RULES, '帮我发个邮件')[0] === 'lark-mail')
check('weather guard', matchRules(DEFAULT_RULES, '今天天气怎么样').length === 0)

check('escapeRegex escapes dot', escapeRegex('a.b') === 'a\\.b')
check('escapeRegex escapes braces', escapeRegex('a{b}c') === 'a\\{b\\}c')
check('escaped literal matches', new RegExp(escapeRegex('维基百科'), 'iu').test('查一下维基百科'))

const rs = rulesFromSummaries([
  { name: 'lark-wiki', whenToUse: '维基百科' },
  { name: 'x', whenToUse: 'a very long prose value that exceeds the eighty character limit and should be skipped entirely by the filter' },
  { name: 'y', whenToUse: undefined },
])
check('rulesFromSummaries keeps short triggers only', rs.length === 1 && rs[0].pour[0] === 'lark-wiki')
check('trigger matches literal text', matchRules(rs, '帮我查维基百科')[0] === 'lark-wiki')

console.log('TOTAL pass=' + pass + ' fail=' + fail)
process.exit(fail === 0 ? 0 : 1)
