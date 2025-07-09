
# Vite

# Vite setup

The initial React + TypeScript + Vite project scaffolding for [`web` project setup](about_setup_web.md)
is done with a Vite template.

The instructions are at: [Vite Scaffolding Your First Vite Project][vite-scaffold]
and the template to use is [template-react-ts].

Per [template-react-ts], either [Babel] or [SWC] can be used for Fast Refresh.
The SWC version requires `--template react-swc-ts` but we use the Babel version, i.e. `--template react-ts`.

For more on tsc vs Babel vs SWC, see [Babel vs tsc] and [Vite react-ts vs react-swc-ts][soq-vite-swc].

# Vite setup commands

```powershell
npm create vite@latest web -- --template react-ts

# As of 2025-07-7: the above will prompt to install create-vite@7.0.0 package.
cd web
npm install
# As of 2025-07-07: added 233 packages, and audited 234 packages in 18s

npm run dev # To locally verify that things work
# git add, commit and push
```

# Vite configuration

🚧KJA

[Babel vs tsc]: https://www.typescriptlang.org/docs/handbook/babel-with-typescript.html
[Babel]: https://babeljs.io/docs/
[soq-vite-swc]: https://stackoverflow.com/questions/79111563/what-is-the-difference-of-typescript-vs-typescript-swc-when-creating-a-vite-pr
[SWC]: https://swc.rs/
[template-react-ts]: https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts
[vite-scaffold]: https://vite.dev/guide/#scaffolding-your-first-vite-project
