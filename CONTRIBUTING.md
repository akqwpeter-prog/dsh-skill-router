# Contributing

Keep the router lazy: rule changes belong in YAML, not in code. A PR
that touches `policy.js` or `index.js` should ship with a unit test in
`test/`; the CI gate runs them on every push.
