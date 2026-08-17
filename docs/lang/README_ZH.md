<div align="center">

<img src="../social-preview.png" alt="dsh-skill-router — 规则优先的 pre-step 技能路由" width="100%">

<br>

# 🍸→⚙️ dsh-skill-router

### *规则优先的 pre-step 技能路由：命中才倒酒，拿不准就闭嘴。*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Test CI](https://github.com/akqwpeter-prog/dsh-skill-router/actions/workflows/test.yml/badge.svg)](https://github.com/akqwpeter-prog/dsh-skill-router/actions/workflows/test.yml)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-Plugin-4D6BFE)](https://github.com/topics/dsh-plugin)
[![Deterministic](https://img.shields.io/badge/engine-rules%20only%2C%20zero%20LLM-2EA44F)](../../README.md#-how-it-works)
[![Companion](https://img.shields.io/badge/companion-skill--bartender-4D6BFE)](https://github.com/akqwpeter-prog/skill-bartender)

<br>

是 [skill-bartender](https://github.com/akqwpeter-prog/skill-bartender) 的执行器搭档：
skill 负责策略**判断**，插件负责策略**执行**。纯规则、确定性、
**零 LLM 调用、不命中零 token**：

- ⚡ **Pre-step 钩子** — 每一步开始前读取最新用户消息。
- 🧭 **规则优先匹配** — 用户可编辑的 YAML 策略（`~/.dsh/skill-router.yaml`，
  内置默认见 `default-policy.yaml`），首条命中即停。
- 🔇 **静默未命中** — 不命中零介入，模型继续走原生目录流程。
- ♻️ **每会话一次** — 每个技能每会话最多注入一次。
- 🛡️ **YAML 损坏不炸会话** — 回退内置默认。

[为什么](#-为什么) · [工作机制](#-工作机制) · [能做什么](#-能做什么) · [快速开始](#-快速开始) · [效果演示](#-效果演示) · [策略](#-策略) · [测试](#-测试) · [边界与非目标](#-边界与非目标) · [FAQ](#-faq) · [目录结构](#-目录结构) · [许可证](#-许可证)

[**English**](../../README.md) · [**简体中文**](README_ZH.md)

</div>

---

## 🤔 为什么

大多数技能加载靠模型临场判断：每一步都看到目录、每次都重新决定，常常加载得
晚、加载得错、或者干脆不加载。在模型回答**之前**跑一个路由器，就把这件事定住了：

| | dsh-skill-router | LLM 法官式路由 | 手工加载 |
|---|---|---|---|
| 决策者 | **规则**（确定性） | LLM / embedding | 模型，每一步 |
| Token 开销 | 命中前为零 | 每步都花 | 每步都花 |
| 额外延迟 | ~0 ms | 模型往返 | 无 |
| 可复现 | ✅ 同消息同结果 | ❌ 每次飘 | ❌ 每次飘 |
| 用户控制 | 改 YAML 即生效 | 靠提示词 | 靠它记住 |

**为什么用规则而不用 LLM 法官？** 速度、成本、可预测。一条 URL 路径规则
（`feishu.cn/x/docx/` → `lark-doc`）微秒级命中、免费、每次都一样——而策略
**判断**本来就该住在 skill-bartender 的路由表里。本插件是肌肉，不是大脑。

## ⚙️ 工作机制

- 挂 `agent/pre-step`，读取最新用户消息。
- 按用户可编辑的规则表匹配（`~/.dsh/skill-router.yaml`，内置默认见
  `default-policy.yaml`）。首条命中即停。
- 命中：把匹配技能正文作为 `skill-invocation` 消息注入——自动满足
  目录的「已加载勿重载」规则。
- 不命中：零介入，模型继续走原生目录流程。
- 每个技能每会话最多注入一次。

## ✨ 能做什么

| 能力 | 做什么 |
|---|---|
| ⚡ Pre-step 钩子 | `agent/pre-step` —— 模型开始思考**之前**就完成注入 |
| 🧭 YAML 策略 | 用户可编辑 `~/.dsh/skill-router.yaml`；YAML 损坏回退内置默认 |
| 🔎 `whenToUse` 触发 | 已装技能的 `whenToUse` frontmatter 作为次级触发（字面短语匹配，追加在 YAML 规则之后） |
| 🚀 零成本 | 无 LLM 法官、无 embedding —— 只有规则（快、免费、确定） |
| ♻️ 每会话一次 | 按会话去重注入，技能正文不刷屏 |
| 🔗 配套 | 与 skill-bartender 的路由表和品鉴流程配合 |

## ⚡ 快速开始

```sh
dsh plugin --profile web add github:akqwpeter-prog/dsh-skill-router
```

安装后重启实例（profile bundle 在启动时加载）。

验证：说「生成一张海报」——`media-tools` 自动注入；说「这个截图帮我检查一下」
——`vision-review` 自动注入。没有任何规则命中？模型照常工作，跟没装一样。

## 📸 效果演示

*一图流：规则命中 → 模型回答前技能已注入；没命中 → 完全静默。*

<img src="../screenshots/how-it-works.png" alt="工作机制：agent/pre-step 读取消息 → 规则匹配（YAML 优先，再 whenToUse）→ 命中？→ 注入 skill-invocation（每会话一次）或静默（零 token）" width="100%">

## 🧭 策略

```yaml
# ~/.dsh/skill-router.yaml
rules:
  - match: "(生成|画).{0,12}(图|海报|banner)"
    pour: [media-tools]
```

- 按精度排序：URL 路径路由最前，媒体、委派、workflow 先于原子技能。
- 首条命中即停；`pour` 列出要加载的技能名。
- YAML 损坏时回退内置默认，绝不破坏会话。
- 规则表是数据：调匹配只改 YAML，不动代码。
- 完整参考：[docs/POLICY.md](../POLICY.md) · 内置默认：[default-policy.yaml](../../default-policy.yaml) · 走查：[docs/EXAMPLES.md](../EXAMPLES.md)。

## 🧪 测试

对真实 profile 跑过 10 例集成测试：注入、去重、零介入、reject 透传、
URL 路由、邮件/消息分流、防误配守卫。见仓库 `test/`，设计笔记见
[DESIGN.md](../../DESIGN.md)，gold-task 清单见 [GOLD-TASKS.md](../../GOLD-TASKS.md)。

## 🎯 边界与非目标

- 无 LLM 法官、无 embedding：只有规则（快、免费、确定）。
- 不自动安装缺失技能——那属于 skill-bartender 的
  隔离 → SkillSpector → 人工确认流程。
- 规则表是数据：调匹配只改 YAML，不动代码。
- 已装技能的 `whenToUse` frontmatter 作为次级触发（字面短语匹配，追加在
  YAML 规则之后）。写成短触发短语；长篇描述永远匹配不上。目前多数技能数据
  缺这个字段——skill-bartender 的品鉴流程可以补上。

## ❓ FAQ

**没有规则命中时消耗 token 吗？**
不消耗。未命中 = 零介入、零 LLM 调用。路由器只读步骤里已有的文本跑正则——
微秒级、免费。

**和 skill-bartender 有什么区别？**
skill-bartender 负责**判断**（哪个技能合适、何时闭嘴、怎么安全安装）；本插件
负责**执行**（确定性的 pre-step 钩子注入）。两者互补；router 单独用也行。

**能用我自己的规则吗？**
能——把 `default-policy.yaml` 拷成 `~/.dsh/skill-router.yaml` 自己改。
首条命中即停；YAML 损坏回退默认。

**同一个技能一个会话会注入两次吗？**
不会——每个技能每会话最多注入一次，上下文不会被刷屏。

## 🗺️ 目录结构

```
dsh-skill-router/
├── index.js               # Cordis 插件：pre-step 钩子 + 注入逻辑
├── policy.js              # 规则加载 / 匹配（有单元测试）
├── default-policy.yaml    # 内置默认（拷到 ~/.dsh/skill-router.yaml 编辑）
├── test/                  # 策略单测 + 集成套件
├── DESIGN.md / GOLD-TASKS.md    # 设计笔记 + gold-task 清单
├── docs/
│   ├── screenshots/how-it-works.png
│   ├── POLICY.md / EXAMPLES.md
│   ├── social-preview.png  # banner（scripts/ 重新生成）
│   └── lang/README_ZH.md   # 简体中文
├── scripts/
│   ├── make-banner.py      # 合成 docs/social-preview.png
│   ├── make-diagram.py     # 合成流程图
│   └── check-policy.mjs    # 策略校验
├── cordis.patch.yml / package.json   # DSH bundle 清单
└── LICENSE (MIT)
```

## 🤝 加入 DSH 插件生态

DeepSeek Harness 开发者预览版仍处于 Harness 开发者测试阶段；核心插件与基础
API 会持续迭代。期待与全球开发者在开源、开放、可复用、可组合的基础设施之上
共同探索智能的上限。

- [dsh-plugin topic](https://github.com/topics/dsh-plugin)
- [快速开始](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)
- [DeepSeek Harness 仓库](https://github.com/deepseek-ai/deepseek-harness)
- 策略搭档：[skill-bartender](https://github.com/akqwpeter-prog/skill-bartender)

> 本仓库已标记 [`dsh-plugin`](https://github.com/topics/dsh-plugin)，收录于
> [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
> 精选列表。欢迎 PR、issue 与翻译。

## 📄 许可证

[MIT](../../LICENSE)
