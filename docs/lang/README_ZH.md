# dsh-skill-router 🍸→⚙️

**规则优先的 pre-step 技能路由器（DeepSeek Harness 插件）。**

是 [skill-bartender](https://github.com/akqwpeter-prog/skill-bartender) 的执行器搭档：
skill 负责策略**判断**，插件负责策略**执行**。纯规则、零 LLM 调用、不命中零 token。

## 工作机制

- 挂 `agent/pre-step`，读取最新用户消息。
- 按用户可编辑的规则表匹配（`~/.dsh/skill-router.yaml`，内置默认见
  `default-policy.yaml`）。首条命中即停。
- 命中：把匹配技能正文作为 `skill-invocation` 消息注入——自动满足
  目录的「已加载勿重载」规则。
- 不命中：零介入，模型继续走原生目录流程。
- 每个技能每会话最多注入一次。

## 安装

    dsh plugin --profile web add github:akqwpeter-prog/dsh-skill-router

安装后重启实例（profile bundle 在启动时加载）。

## 策略

    # ~/.dsh/skill-router.yaml
    rules:
      - match: "(生成|画).{0,12}(图|海报|banner)"
        pour: [media-tools]

按精度排序：URL 路径路由最前，媒体、委派、workflow 先于原子技能。
YAML 损坏时回退内置默认，绝不破坏会话。

## 边界与非目标

- 无 LLM 法官、无 embedding：只有规则（快、免费、确定）。
- 不自动安装缺失技能——那属于 skill-bartender 的
  隔离 → SkillSpector → 人工确认流程。
- 规则表是数据：调匹配只改 YAML，不动代码。

## 测试

对真实 profile 跑过 10 例集成测试：注入、去重、零介入、reject 透传、
URL 路由、邮件/消息分流、防误配守卫。见仓库 test/。

## 许可证

MIT。
