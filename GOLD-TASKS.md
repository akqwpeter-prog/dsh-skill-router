# 黄金任务集（GOLD-TASKS）

> 路由器评测用。每条：任务 → 期望加载集 → 理由。
> 来源：本机真实会话（dsh-session-*.zip 挖掘）+ lark 家族合成案例。

## A. 真实任务（从你的会话历史提取）

| # | 任务 | 期望加载 | 理由 |
|---|---|---|---|
| 1 | 「把 Codex 里读图+生图 skill 应用到 DSH」 | **无** | 移植/开发任务，读源码即可（阶梯 0），当时目标技能还不存在 |
| 2 | 「生成几张图试试」 | media-tools | 生图唯一匹配；验证图才需要 vision-review，属第二步 |
| 3 | 「确认隐私和安全性，不要有 key」 | **无** | 审计任务，子代理+代码扫描，无技能匹配 |
| 4 | 「当前模型不支持读图，能改吗」 | **无** | DSH 机制研究，读源码，无技能匹配 |
| 5 | 「发布到 GitHub 加入 dsh-plugin 生态」 | **无** | gh CLI + git 直接完成 |

> 注意：#1–#5 里有 4 条期望是「零加载」——这就是阶梯 0 的价值，
> 也是评测最该防的：错配加载。

## B. 合成案例（lark 家族路由，标注期望）

| # | 任务 | 期望加载 | 不要加载 |
|---|---|---|---|
| 6 | 「整理本周会议纪要成周报」 | lark-workflow-meeting-summary | lark-minutes、lark-vc |
| 7 | 「我今天有什么安排和待办」 | lark-workflow-standup-report | lark-calendar + lark-task |
| 8 | 「帮我查一下审批待办」 | lark-approval | lark-task |
| 9 | 「给张三发条消息」 | lark-im | lark-contact（需解析 open_id 时才补） |
| 10 | 「把这张表导入多维表格」 | lark-base | lark-sheets、lark-drive（先定位再路由） |
| 11 | 「查一下上周三的会议纪要」 | lark-vc | lark-calendar、lark-minutes |
| 12 | 「改一下这个飞书文档 https://.../docx/...」 | lark-doc | lark-drive、lark-wiki |
| 13 | 「帮我收集一下 Agent Reach 的研究渠道」 | 仅当点名 Agent Reach：agent-reach | 自动加载任何 agent-reach-* |

## 评测方法

- 每条任务开/关策略卡各跑一遍，对比：实际加载集 vs 期望集、总 token、首响延迟。
- 通过标准：错配加载 = 0；漏配 ≤ 2 条（目录兜底仍能完成任务）；token 不升。
