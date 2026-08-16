# Skill 路由策略（懒人版 · v0）

> 放进 \`~/.dsh/AGENTS.md\`（或工作区 AGENTS.md），40 行内。原则取自 Ponytail：
> 停在第一级能站住的阶梯。加载是成本，错配比漏配贵。

## 阶梯（从上往下，第一级能站住就停）

0. **不需要技能就不加载**：read/glob/grep/bash/web_search 直接能干完的，零加载。
1. **单个最贴合的 skill**：只加载那一个。
2. **组合任务优先 workflow 类**（内部已编排），不手工拼原子 skill。
3. **拿不准 → 不加载**，继续用目录描述判断。正文一旦加载永久留史，漏配 < 错配。

## 映射表

| 任务特征 | 加载 | 不要加载 |
|---|---|---|
| 生成图片/插画/海报/banner | media-tools | vision-review |
| 读图/看截图/视觉检查 | vision-review | media-tools |
| 派活给 Codex/Claude Code 等外部 CLI | conductor | — |
| 飞书审批 查询/发起 | lark-approval | lark-task |
| 会议纪要整理/周报 | lark-workflow-meeting-summary | lark-minutes、lark-vc |
| 今天/本周 日程+待办 | lark-workflow-standup-report | lark-calendar + lark-task |
| 发消息/查聊天记录 | lark-im | — |
| 邮件相关 | lark-mail | — |
| 日历/订会议室 | lark-calendar | lark-vc |
| 已结束会议的纪要/逐字稿 | lark-vc | lark-calendar |
| 进行中会议（机器人入会） | lark-vc-agent | — |
| 多维表格 Base | lark-base | lark-sheets |
| 电子表格 | lark-sheets | lark-base |
| OKR | lark-okr | — |
| 云文档 URL/token | 按路径路由 doc/drive/wiki/sheets/base/slides **之一** | 全家桶 |
| 研究/信息收集 | 仅用户点名时用 agent-reach 系列 | 自动加载 |

## 硬规则

- lark 家族按 URL 路径模式路由，一次一个，勿全家桶。
- agent-reach 系列、lark-openapi-explorer、lark-skill-maker：**用户明确点名才加载**。
- 加载后没用上 → 会话总结里记一句「X 未用」，下次同类任务不再加载（学习）。
- 首次匹配某任务只加载一个 skill；确实不够再补第二个，不要预防性加载。
