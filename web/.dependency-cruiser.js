/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    // Circular dependencies are not allowed
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are not allowed',
      from: {},
      to: {
        circular: true,
      },
    },
    // lib/ cannot import react or @mui
    {
      name: 'lib-no-react-or-mui',
      severity: 'error',
      comment: 'Code in web/src/lib/ cannot depend on react nor @mui external code',
      from: {
        path: '^src/lib',
      },
      to: {
        dependencyTypes: ['npm'],
        path: '^(react|@mui)',
      },
    },
    // Only redux/ can import @reduxjs
    {
      name: 'only-redux-can-import-reduxjs',
      severity: 'error',
      comment: 'Only code in web/src/redux/ can depend on @reduxjs external code',
      from: {
        pathNot: '^src/redux',
      },
      to: {
        dependencyTypes: ['npm'],
        path: '^@reduxjs',
      },
    },
    // main.tsx can import from App.tsx, theme.tsx, Error, store.ts and their transitive dependencies
    // Transitive: components/*, hooks.ts, selectors, lib/game_utils, lib/model, lib/primitives, and all redux transitive deps
    // Since main.tsx can import from almost everything via transitive deps, only forbid src/assets
    {
      name: 'main-tsx-restrictions',
      severity: 'error',
      comment:
        'main.tsx can directly import from App.tsx, theme.tsx, Error, store.ts, and their transitive dependencies (components/*, hooks.ts, selectors, lib/game_utils, lib/model, lib/primitives, redux/*)',
      from: {
        path: '^src/main\\.tsx$',
      },
      to: {
        path: '^src/assets',
      },
    },
    // components/styling/theme.tsx can import from components/styling and its transitive dependencies
    // Transitive: lib/model, lib/primitives
    {
      name: 'components-theme-restrictions',
      severity: 'error',
      comment:
        'components/styling/theme.tsx can directly import from components/styling and its transitive dependencies (lib/model, lib/primitives)',
      from: {
        path: '^src/components/styling/theme\\.tsx$',
      },
      to: {
        pathNot: '^(src/components/styling|src/lib/(model|primitives))',
        path: '^src',
      },
    },
    // components/App.tsx can import from components/* and its transitive dependencies
    // Transitive: hooks.ts, selectors, theme.tsx, lib/game_utils, store.ts, rootReducer.ts, slices, reducer_utils, reducers, lib/model, lib/primitives
    {
      name: 'components-app-restrictions',
      severity: 'error',
      comment:
        'components/App.tsx can directly import from components/* and its transitive dependencies (hooks.ts, selectors, theme.tsx, lib/game_utils, store.ts, rootReducer.ts, slices, reducer_utils, reducers, lib/model, lib/primitives)',
      from: {
        path: '^src/components/App\\.tsx$',
      },
      to: {
        pathNot: '^(src/components|src/redux|src/lib)',
        path: '^src',
      },
    },
    // components/Error can import from components/* and its transitive dependencies
    // Transitive: hooks.ts, selectors, theme.tsx, lib/game_utils, store.ts, rootReducer.ts, slices, reducer_utils, reducers, lib/model, lib/primitives
    {
      name: 'components-error-restrictions',
      severity: 'error',
      comment:
        'components/Error can directly import from components/* and its transitive dependencies (hooks.ts, selectors, theme.tsx, lib/game_utils, store.ts, rootReducer.ts, slices, reducer_utils, reducers, lib/model, lib/primitives)',
      from: {
        path: '^src/components/Error',
      },
      to: {
        pathNot: '^(src/components|src/redux|src/lib)',
        path: '^src',
      },
    },
    // components/* (other than App.tsx, Error, styling/theme.tsx) can import from hooks.ts, selectors, theme.tsx, lib/game_utils and their transitive dependencies
    // Transitive: store.ts, rootReducer.ts, slices, reducer_utils, reducers, lib/model, lib/primitives
    {
      name: 'components-general-restrictions',
      severity: 'error',
      comment:
        'components/* can directly import from hooks.ts, selectors, theme.tsx, lib/game_utils, components/*, and their transitive dependencies (store.ts, rootReducer.ts, slices, reducer_utils, reducers, lib/model, lib/primitives)',
      from: {
        path: '^src/components',
        pathNot: '^src/components/(App\\.tsx|Error|styling/theme\\.tsx)$',
      },
      to: {
        pathNot: '^(src/components|src/redux|src/lib)',
        path: '^src',
      },
    },
    // components/styling (except theme.tsx) can import from lib/model and its transitive dependencies
    // Transitive: lib/primitives
    {
      name: 'components-styling-restrictions',
      severity: 'error',
      comment:
        'components/styling (except theme.tsx) can directly import from lib/model, components/styling, and transitive dependencies (lib/primitives)',
      from: {
        path: '^src/components/styling',
        pathNot: '^src/components/styling/theme\\.tsx$',
      },
      to: {
        pathNot: '^(src/components/styling|src/lib/(model|primitives))',
        path: '^src',
      },
    },
    // redux/store.ts can import from rootReducer.ts, eventsMiddleware.ts, persist.ts and their transitive dependencies
    // Transitive: slices, reducer_utils, reducers, lib/game_utils, lib/model
    {
      name: 'redux-store-restrictions',
      severity: 'error',
      comment:
        'redux/store.ts can directly import from rootReducer.ts, eventsMiddleware.ts, persist.ts, and their transitive dependencies (slices, reducer_utils, reducers, lib/game_utils, lib/model)',
      from: {
        path: '^src/redux/store\\.ts$',
      },
      to: {
        pathNot:
          '^(src/redux/(eventsMiddleware|rootReducer|persist|slices|reducer_utils|reducers)\\.ts|src/redux/(slices|reducer_utils|reducers)|src/lib/(game_utils|model))',
        path: '^(src/redux|src/lib)',
      },
    },
    // redux/eventsMiddleware.ts can import from rootReducer.ts, reducer_utils and their transitive dependencies
    // Transitive: slices, reducers, lib/game_utils, lib/model
    {
      name: 'redux-events-middleware-restrictions',
      severity: 'error',
      comment:
        'redux/eventsMiddleware.ts can directly import from rootReducer.ts, reducer_utils, and their transitive dependencies (slices, reducers, lib/game_utils, lib/model)',
      from: {
        path: '^src/redux/eventsMiddleware\\.ts$',
      },
      to: {
        pathNot: '^(src/redux/(rootReducer\\.ts|reducer_utils|slices|reducers)|src/lib/(game_utils|model))',
        path: '^(src/redux|src/lib)',
      },
    },
    // redux/slices can import from reducers, lib/game_utils and their transitive dependencies
    // Transitive: reducer_utils, lib/model, lib/factories, lib/ruleset, lib/model_utils, lib/data_tables, lib/primitives
    // Also allow imports within redux/slices (same directory)
    {
      name: 'redux-slices-restrictions',
      severity: 'error',
      comment:
        'redux/slices can directly import from redux/slices (same directory), reducers, lib/game_utils, and their transitive dependencies (reducer_utils, lib/model, lib/factories, lib/ruleset, lib/model_utils, lib/data_tables, lib/primitives)',
      from: {
        path: '^src/redux/slices',
      },
      to: {
        pathNot:
          '^(src/redux/(slices|reducers|reducer_utils)|src/lib/(game_utils|model|factories|ruleset|model_utils|data_tables|primitives))',
        path: '^(src/redux|src/lib)',
      },
    },
    // redux/reducers can import from reducer_utils, lib/game_utils and their transitive dependencies
    // Transitive: lib/model, lib/factories, lib/ruleset, lib/model_utils, lib/data_tables, lib/primitives
    // Also allow imports within redux/reducers (same directory)
    {
      name: 'redux-reducers-restrictions',
      severity: 'error',
      comment:
        'redux/reducers can directly import from redux/reducers (same directory), reducer_utils, lib/game_utils, and their transitive dependencies (lib/model, lib/factories, lib/ruleset, lib/model_utils, lib/data_tables, lib/primitives)',
      from: {
        path: '^src/redux/reducers',
      },
      to: {
        pathNot:
          '^(src/redux/(reducers|reducer_utils)|src/lib/(game_utils|model|factories|ruleset|model_utils|data_tables|primitives))',
        path: '^(src/redux|src/lib)',
      },
    },
    // redux/reducer_utils can import from lib/model and its transitive dependencies
    // Transitive: lib/primitives
    // Also allow imports within redux/reducer_utils (same directory)
    {
      name: 'redux-reducer-utils-restrictions',
      severity: 'error',
      comment:
        'redux/reducer_utils can directly import from redux/reducer_utils (same directory), lib/model and its transitive dependencies (lib/primitives)',
      from: {
        path: '^src/redux/reducer_utils',
      },
      to: {
        pathNot: '^(src/redux/reducer_utils|src/lib/(model|primitives))',
        path: '^(src/redux|src/lib)',
      },
    },
    // redux/hooks.ts can import from store.ts, rootReducer.ts and their transitive dependencies
    // Transitive: eventsMiddleware.ts, persist.ts, slices, reducer_utils, reducers, lib/game_utils, lib/model
    {
      name: 'redux-hooks-restrictions',
      severity: 'error',
      comment:
        'redux/hooks.ts can directly import from store.ts, rootReducer.ts, and their transitive dependencies (eventsMiddleware.ts, persist.ts, slices, reducer_utils, reducers, lib/game_utils, lib/model)',
      from: {
        path: '^src/redux/hooks\\.ts$',
      },
      to: {
        pathNot:
          '^(src/redux/(store|rootReducer|eventsMiddleware|persist|slices|reducer_utils|reducers)\\.ts|src/redux/(slices|reducer_utils|reducers)|src/lib/(game_utils|model))',
        path: '^(src/redux|src/lib)',
      },
    },
    // redux/selectors can import from rootReducer.ts and its transitive dependencies
    // Transitive: slices, reducer_utils, reducers, lib/game_utils, lib/model
    // Also allow imports within redux/selectors (same directory)
    {
      name: 'redux-selectors-restrictions',
      severity: 'error',
      comment:
        'redux/selectors can directly import from redux/selectors (same directory), rootReducer.ts and its transitive dependencies (slices, reducer_utils, reducers, lib/game_utils, lib/model)',
      from: {
        path: '^src/redux/selectors',
      },
      to: {
        pathNot: '^(src/redux/(selectors|rootReducer\\.ts|slices|reducer_utils|reducers)|src/lib/(game_utils|model))',
        path: '^(src/redux|src/lib)',
      },
    },
    // redux/rootReducer.ts can import from slices, reducer_utils and their transitive dependencies
    // Transitive: reducers, lib/game_utils, lib/model
    {
      name: 'redux-root-reducer-restrictions',
      severity: 'error',
      comment:
        'redux/rootReducer.ts can directly import from slices, reducer_utils, and their transitive dependencies (reducers, lib/game_utils, lib/model)',
      from: {
        path: '^src/redux/rootReducer\\.ts$',
      },
      to: {
        pathNot: '^(src/redux/(slices|reducer_utils|reducers)|src/lib/(game_utils|model))',
        path: '^(src/redux|src/lib)',
      },
    },
    // redux/persist.ts can import from rootReducer.ts and its transitive dependencies
    // Transitive: slices, reducer_utils, reducers, lib/game_utils, lib/model
    {
      name: 'redux-persist-restrictions',
      severity: 'error',
      comment:
        'redux/persist.ts can directly import from rootReducer.ts and its transitive dependencies (slices, reducer_utils, reducers, lib/game_utils, lib/model)',
      from: {
        path: '^src/redux/persist\\.ts$',
      },
      to: {
        pathNot: '^(src/redux/rootReducer\\.ts|src/redux/(slices|reducer_utils|reducers)|src/lib/(game_utils|model))',
        path: '^(src/redux|src/lib)',
      },
    },
    // lib/game_utils can import from lib/factories and its transitive dependencies
    // Transitive: lib/ruleset, lib/model_utils, lib/data_tables, lib/model, lib/primitives
    // Also allow imports within lib/game_utils (same directory)
    {
      name: 'lib-game-utils-restrictions',
      severity: 'error',
      comment:
        'lib/game_utils can directly import from lib/game_utils (same directory), lib/factories and its transitive dependencies (lib/ruleset, lib/model_utils, lib/data_tables, lib/model, lib/primitives)',
      from: {
        path: '^src/lib/game_utils',
      },
      to: {
        pathNot: '^src/lib/(game_utils|factories|ruleset|model_utils|data_tables|model|primitives)',
        path: '^src/lib',
      },
    },
    // lib/factories can import from lib/ruleset and its transitive dependencies
    // Transitive: lib/model_utils, lib/data_tables, lib/model, lib/primitives
    // Also allow imports within lib/factories (same directory)
    {
      name: 'lib-factories-restrictions',
      severity: 'error',
      comment:
        'lib/factories can directly import from lib/factories (same directory), lib/ruleset and its transitive dependencies (lib/model_utils, lib/data_tables, lib/model, lib/primitives)',
      from: {
        path: '^src/lib/factories',
      },
      to: {
        pathNot: '^src/lib/(factories|ruleset|model_utils|data_tables|model|primitives)',
        path: '^src/lib',
      },
    },
    // lib/ruleset can import from lib/model_utils and its transitive dependencies
    // Transitive: lib/data_tables, lib/model, lib/primitives
    // Also allow imports within lib/ruleset (same directory)
    {
      name: 'lib-ruleset-restrictions',
      severity: 'error',
      comment:
        'lib/ruleset can directly import from lib/ruleset (same directory), lib/model_utils and its transitive dependencies (lib/data_tables, lib/model, lib/primitives)',
      from: {
        path: '^src/lib/ruleset',
      },
      to: {
        pathNot: '^src/lib/(ruleset|model_utils|data_tables|model|primitives)',
        path: '^src/lib',
      },
    },
    // lib/model_utils can import from lib/data_tables and its transitive dependencies
    // Transitive: lib/model, lib/primitives
    // Also allow imports within lib/model_utils (same directory)
    {
      name: 'lib-model-utils-restrictions',
      severity: 'error',
      comment:
        'lib/model_utils can directly import from lib/model_utils (same directory), lib/data_tables and its transitive dependencies (lib/model, lib/primitives)',
      from: {
        path: '^src/lib/model_utils',
      },
      to: {
        pathNot: '^src/lib/(model_utils|data_tables|model|primitives)',
        path: '^src/lib',
      },
    },
    // lib/data_tables can import from lib/model and its transitive dependencies
    // Transitive: lib/primitives
    // Also allow imports within lib/data_tables (same directory)
    {
      name: 'lib-data-tables-restrictions',
      severity: 'error',
      comment:
        'lib/data_tables can directly import from lib/data_tables (same directory), lib/model and its transitive dependencies (lib/primitives)',
      from: {
        path: '^src/lib/data_tables',
      },
      to: {
        pathNot: '^src/lib/(data_tables|model|primitives)',
        path: '^src/lib',
      },
    },
    // lib/model can import from lib/primitives (no transitive dependencies beyond primitives)
    // Also allow imports within lib/model (same directory)
    {
      name: 'lib-model-restrictions',
      severity: 'error',
      comment: 'lib/model can directly import from lib/model (same directory), lib/primitives',
      from: {
        path: '^src/lib/model',
      },
      to: {
        pathNot: '^src/lib/(model|primitives)',
        path: '^src/lib',
      },
    },
    // Primitives: assertPrimitives.ts can import from mathPrimitives.ts (no transitive dependencies)
    {
      name: 'primitives-assert-restrictions',
      severity: 'error',
      comment: 'lib/primitives/assertPrimitives.ts can directly import from mathPrimitives.ts',
      from: {
        path: '^src/lib/primitives/assertPrimitives\\.ts$',
      },
      to: {
        pathNot: '^src/lib/primitives/mathPrimitives\\.ts$',
        path: '^src/lib/primitives',
      },
    },
    // Primitives: fixed6.ts can import from assertPrimitives.ts, mathPrimitives.ts, formatPrimitives.ts
    // formatPrimitives.ts --> mathPrimitives.ts, but mathPrimitives.ts has no deps, so no additional transitive
    {
      name: 'primitives-fixed6-restrictions',
      severity: 'error',
      comment:
        'lib/primitives/fixed6.ts can directly import from assertPrimitives.ts, mathPrimitives.ts, formatPrimitives.ts',
      from: {
        path: '^src/lib/primitives/fixed6\\.ts$',
      },
      to: {
        pathNot: '^src/lib/primitives/(assertPrimitives|mathPrimitives|formatPrimitives)\\.ts$',
        path: '^src/lib/primitives',
      },
    },
    // Primitives: formatPrimitives.ts can import from mathPrimitives.ts (no transitive dependencies)
    {
      name: 'primitives-format-restrictions',
      severity: 'error',
      comment: 'lib/primitives/formatPrimitives.ts can directly import from mathPrimitives.ts',
      from: {
        path: '^src/lib/primitives/formatPrimitives\\.ts$',
      },
      to: {
        pathNot: '^src/lib/primitives/mathPrimitives\\.ts$',
        path: '^src/lib/primitives',
      },
    },
    // Primitives: rand.ts can import from assertPrimitives.ts and its transitive dependencies
    // Transitive: mathPrimitives.ts
    {
      name: 'primitives-rand-restrictions',
      severity: 'error',
      comment:
        'lib/primitives/rand.ts can directly import from assertPrimitives.ts and its transitive dependencies (mathPrimitives.ts)',
      from: {
        path: '^src/lib/primitives/rand\\.ts$',
      },
      to: {
        pathNot: '^src/lib/primitives/(assertPrimitives|mathPrimitives)\\.ts$',
        path: '^src/lib/primitives',
      },
    },
    // Primitives: stringPrimitives.ts can import from assertPrimitives.ts and its transitive dependencies
    // Transitive: mathPrimitives.ts
    {
      name: 'primitives-string-restrictions',
      severity: 'error',
      comment:
        'lib/primitives/stringPrimitives.ts can directly import from assertPrimitives.ts and its transitive dependencies (mathPrimitives.ts)',
      from: {
        path: '^src/lib/primitives/stringPrimitives\\.ts$',
      },
      to: {
        pathNot: '^src/lib/primitives/(assertPrimitives|mathPrimitives)\\.ts$',
        path: '^src/lib/primitives',
      },
    },
    // Primitives: rolls.ts can import from assertPrimitives.ts, fixed6.ts, formatPrimitives.ts, mathPrimitives.ts, rand.ts
    // All transitive dependencies are already covered by the explicit list (mathPrimitives.ts is the only transitive dep)
    {
      name: 'primitives-rolls-restrictions',
      severity: 'error',
      comment:
        'lib/primitives/rolls.ts can directly import from assertPrimitives.ts, fixed6.ts, formatPrimitives.ts, mathPrimitives.ts, rand.ts',
      from: {
        path: '^src/lib/primitives/rolls\\.ts$',
      },
      to: {
        pathNot: '^src/lib/primitives/(assertPrimitives|fixed6|formatPrimitives|mathPrimitives|rand)\\.ts$',
        path: '^src/lib/primitives',
      },
    },
    // Primitives: mathPrimitives.ts cannot import from other primitives
    {
      name: 'primitives-math-no-imports',
      severity: 'error',
      comment: 'lib/primitives/mathPrimitives.ts cannot import from other primitives',
      from: {
        path: '^src/lib/primitives/mathPrimitives\\.ts$',
      },
      to: {
        path: '^src/lib/primitives',
        pathNot: '^src/lib/primitives/mathPrimitives\\.ts$',
      },
    },
    // Test directory can import from src/ following the same rules as src/
    // This is handled implicitly - test files can import from src/ and the rules above will apply
    // No additional rules needed as test/ imports are validated against src/ rules
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'default'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: '^node_modules/[^/]+',
        theme: {
          graph: {
            splines: 'ortho',
          },
        },
      },
    },
  },
}
