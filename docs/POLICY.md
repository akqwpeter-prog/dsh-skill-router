# Policy format

`~/.dsh/skill-router.yaml` — or the bundled `default-policy.yaml` when
no user file exists.

    rules:
      - match: "(生成|画).{0,12}(图|海报|banner)"
        pour: [media-tools]

## Semantics

- `match` is a regex (flags `iu`). **First matching rule wins.**
- `pour` lists skill names to load; existing and model-invocable skills
  are poured as `skill-invocation` messages, each at most once per
  session.
- Order rules by precision: URL-path rules first, media, delegation,
  workflow skills before atomic ones.
- `whenToUse` frontmatter on any installed skill is appended as a
  literal-phrase rule after your YAML rules (your rules win ties).
- Broken YAML or invalid regexes fall back to defaults — the router
  never breaks the session.

Validate a file locally:

    node scripts/check-policy.mjs [path-to-yaml]
