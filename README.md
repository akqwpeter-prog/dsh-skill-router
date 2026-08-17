# dsh-skill-router 🍸→⚙️

[![License](https://img.shields.io/github/license/akqwpeter-prog/dsh-skill-router)](LICENSE)
[![Test CI](https://github.com/akqwpeter-prog/dsh-skill-router/actions/workflows/test.yml/badge.svg)](https://github.com/akqwpeter-prog/dsh-skill-router/actions/workflows/test.yml)
[![dsh-plugin](https://img.shields.io/badge/topic-dsh--plugin-2ea44f)](https://github.com/topics/dsh-plugin)

**Rule-first pre-step skill router for DeepSeek Harness.**

Companion executor to [skill-bartender](https://github.com/akqwpeter-prog/skill-bartender):
the skill carries the policy *judgment*, this plugin carries the *execution*.
Deterministic, zero LLM calls, zero token cost until a rule actually pours.

## How it works

- Hooks `agent/pre-step`, reads the latest user message.
- Matches it against user-editable rules (`~/.dsh/skill-router.yaml`,
  bundled defaults in `default-policy.yaml`). First match wins.
- On a hit: pours the matched skill bodies into the step as
  `skill-invocation` messages — the catalog's "already loaded, don't
  re-load" rule applies automatically.
- No hit: zero intervention. The model keeps its normal catalog flow.
- Each skill pours at most once per session.

## Install

    dsh plugin --profile web add github:akqwpeter-prog/dsh-skill-router

Then restart the running instance (profile bundles load at boot).

## Policy

    # ~/.dsh/skill-router.yaml
    rules:
      - match: "(生成|画).{0,12}(图|海报|banner)"
        pour: [media-tools]

Ordered by precision: URL-path routing first, media, delegation,
workflow skills before atomics. Broken YAML falls back to bundled
defaults and never breaks the session.

## Scope and non-goals

- No LLM judge, no embeddings: rules only (fast, free, deterministic).
- No auto-install of missing skills: that stays in skill-bartender's
  quarantine → SkillSpector → human-approval flow.
- Rule table is data: improve matching by editing YAML, not code.
- `whenToUse` frontmatter on installed skills acts as a secondary
  trigger (literal phrase match, appended after YAML rules). Write it as
  a short trigger phrase; long prose never matches. Today's skill data
  mostly lacks the field — skill-bartender's taste test can backfill it.

## Tested

Integration suite (10 cases) run against a live profile: pour,
dedupe, zero-touch, reject passthrough, URL routing, mail-vs-IM
disambiguation, false-positive guards. See `test/` in the repo.

## License

MIT.
