# About logs

## `lint.debug_2025_11_12_exp1.txt`

A log from running:

`eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0 --debug > lint.debug.txt 2>&1`

For full `eslint.config.js` with `oxlint.configs['flat/all']` added, which should disables hundreds of rules.

## `lint.debug_2025_11_12_exp2.txt`

Same as `lint.debug_2025_11_12_exp1.txt`, but another experiment.

## `lint.debug_2025_11_12_exp3.txt`

Same as `lint.debug_2025_11_12_exp2.txt`, but without `oxlint.configs['flat/all']`,
so all rules are in effect.

## `lint.debug.cached_1_cold_start.txt`

Ran `eslint . --cache --ext ts,tsx --report-unused-disable-directives --max-warnings 0 --debug > lint.debug.txt 2>&1`
with no cache.

## `lint.debug.cached_2nd_run.txt` up to `lint.debug.cached_4th_run.txt`

Same commands as the `lint.debug.cached_1_cold_start.txt` but with warmed up cache.

Shows long inconsistent and long config load times.
