# About package.json

This is the npm config file.

## How to update package.json dependencies to newest versions

`npx npm-check-updates`

https://www.npmjs.com/package/npm-check-updates

🚫 rejected alternative, works worse:
🚫 `npx npm-check`
🚫 https://www.npmjs.com/package/npm-check

## How to find unused dependencies

`npx depcheck`

https://www.npmjs.com/package/depcheck

## When I run npx commands, where does it install packages?

It installs them to `npm cache`.

In Windows it is located at:

``` powershell
ls "$env:LocalAppData/npm-cache/"
```

https://docs.npmjs.com/cli/v7/configuring-npm/folders#cache

See also my OneNote: `Notes reorg / technologies / npm (uninstall, cache)`
