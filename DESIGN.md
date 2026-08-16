# dsh-skill-router · v1 插件设计（融合 Ponytail）

> 原则：路由器自己也要懒。Ponytail（MIT）的阶梯直接套在本项目上：
> 能不做的功能不做，能复用的 DSH 机制不复刻，规则能解决的不用模型。

## 名字与形态

- **bundle 插件**：\`dsh-skill-router\`，dsh.bundle manifest，\`dsh plugin add\` 安装。
- **数据与代码分离**：路由规则放 \`~/.dsh/skill-router.yaml\`（用户可改，不碰代码）。
- 挂 \`ctx.on('agent/pre-step')\`（tool-skill 同款缝），读最新用户消息。

## 阶梯 0：v0 策略卡就是 v1 的配置

POLICY.v0.md 通过评测后，其映射表/硬规则逐条落成 YAML（关键词+正则），
v1 只做执行器：命中才动，不命中零介入（模型仍走原生目录判断）。

## 阶梯 1：只复用，不复刻

| 功能 | 复用 | 说明 |
|---|---|---|
| 技能发现 | \`ctx.skills.list/get\` | 按 scope 拿该 agent 真实技能视图 |
| 正文渲染/注入 | \`renderSkillContent\` | 与 tool-skill 同一渲染，天然遵守「已加载勿重载」 |
| 未装技能来源 | dsh-market / awesome 列表 | 只做推荐链接，不下载不安装 |
| 安全扫描（可选，phase 2） | NVIDIA SkillSpector | 下载链路里的一层过滤，人工确认不可省 |

## 阶梯 2：匹配只用确定性规则

1. \`whenToUse\` frontmatter（host 侧读，模型目录里没有的免费信号）
2. YAML 规则表（关键词/regex）
3. 高置信度 → 注入 \`<skill_content>\`；低置信度 → 不动。
4. 会话内记录已注入集：同一 skill 只注入一次；没用上 → 追加「未用」记录（学习）。
5. 匹配到未安装的 skill → 注入一行推荐（名称/来源/原因），**不自动装**。

**v1 明确不做**：embedding 索引、LLM 法官、自动下载/安装、替换目录。
（做这些 = 阶梯 6/7，等评测证明规则不够再说。）

## Ponytail 集成（本项目的特色）

1. **随包内置 ponytail skill**（MIT，vendored SKILL.md）：
   编码类任务（写码/重构/选依赖）高置信度命中 → 建议注入 ponytail。
   让「懒」成为路由器默认姿势，和 Ponytail 的 `ACTIVE EVERY RESPONSE` 一致。
2. **路由器自己的代码遵守阶梯**：不用模型当匹配器（省 token 省延迟），
   用规则（零成本）——这正是 Ponytail 说的「最好的代码是你没写的代码」。

## 阶段与判据

- **v1a**：规则引擎 + 注入 + GOLD-TASKS 评测。判据：错配 0、token 不升。
- **v1b**：未装推荐卡片（跳 dsh-market）。
- **v1c（可选）**：SkillSpector + 人工确认 + 拷入 \`.dsh/skills\` 的安装流。
- 每一阶段不过判据就停，先修策略（YAML），再动代码。

## 交付物

\`package.json\` + \`cordis.patch.yml\` + \`index.js\` + \`skills/ponytail/SKILL.md\` +
\`POLICY.yaml\`（默认规则，可被 \`~/.dsh/skill-router.yaml\` 覆盖）。
