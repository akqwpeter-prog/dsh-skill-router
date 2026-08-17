# Changelog

## 0.1.3 (2026-08-17)

- Docs: full README refresh to match the dsh-media-skills standard —
  banner header, tagline, badge matrix, TOC + language links, Why/What
  you get tables, quick start, how-it-works diagram, FAQ, layout tree,
  ecosystem section.
- Banner: AI-generated network-routing background + gradient overlay
  (scripts/make-banner.py now composes docs/social-preview.png from
  docs/bg-raw.png via media-tools; bg-raw.png gitignored).
- New scripts/make-diagram.py: docs/screenshots/how-it-works.png.
- Chinese README synced to the new structure.

## 0.1.2 (2026-08-17)

- CI: policy unit tests + syntax checks on every push.
- SECURITY.md, docs/POLICY.md, examples, contributing guide.

## 0.1.1 (2026-08-16)

- Add `whenToUse` trigger support (literal phrase rules appended after
  YAML rules). Test suite expanded to 11 cases.

## 0.1.0 (2026-08-16)

- Initial release: pre-step hook, YAML policy, conservative pour,
  per-session dedupe, zero-touch fallback.
