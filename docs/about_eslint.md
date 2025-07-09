# About eslint

[eslint] is a code linter for TypeScript and JavaScript projects.

# Initial eslint config setup

This section describes how I initially configured `eslint` in the `web` project.

The `eslint.config.js` file in the `web` project was  initially generated with a Vite template
(see [about-vite.md](about_vite.md)), and then adjusted by me to fit the needs of the project.

Note that the README generated with the [create-vite react-ts] template
mentions instructions how to update the config, which I took into account when
[making my adjustments](#eslint-adjustments-i-made).

## eslint adjustments I made

1. I updated the config to target latest ECMA script standard.
1. I made it extend few strict base configs I found in my research.
1. I tweaked each rule to my specific needs.

For the details of the configs I decided to extend, refer to the comments
in the config file itself [eslint.config.js](../web/eslint.config.js).

🚧KJA

[eslint]: https://eslint.org/
[create-vite react-ts]: https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts
