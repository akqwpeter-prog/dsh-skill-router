# Security

dsh-skill-router is a deterministic rule executor: it reads one YAML
policy file and pours installed skill bodies into the step. It never
downloads, installs, or executes third-party code.

## Trust boundaries

- The policy file (`~/.dsh/skill-router.yaml`) is **data**: broken YAML
  falls back to bundled defaults and never breaks the session.
- Rules are matched against user text only; the plugin cannot be
  redirected by skill content it pours (pouring is best-effort and
  each skill pours at most once per session).
- Missing skills are skipped silently: no auto-install, no network.

## Reporting a vulnerability

Open an issue with the `security` label.
