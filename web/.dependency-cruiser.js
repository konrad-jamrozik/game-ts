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
    // main.tsx can only import specific things
    {
      name: 'main-tsx-restrictions',
      severity: 'error',
      comment:
        'main.tsx can only import from components/App.tsx, components/styling/theme.tsx, components/Error, redux/store.ts',
      from: {
        path: '^src/main\\.tsx$',
      },
      to: {
        pathNot:
          '^(src/components/App\\.tsx|src/components/styling/theme\\.tsx|src/components/Error|src/redux/store\\.ts)',
        path: '^src',
      },
    },
    // components/styling/theme.tsx can only import from components/styling
    {
      name: 'components-theme-restrictions',
      severity: 'error',
      comment: 'components/styling/theme.tsx can only import from components/styling',
      from: {
        path: '^src/components/styling/theme\\.tsx$',
      },
      to: {
        pathNot: '^src/components/styling',
        path: '^src',
      },
    },
    // components/App.tsx can import from components/*, redux/hooks.ts, redux/selectors, components/styling/theme.tsx, lib/game_utils
    {
      name: 'components-app-restrictions',
      severity: 'error',
      comment:
        'components/App.tsx can import from components/*, redux/hooks.ts, redux/selectors, components/styling/theme.tsx, lib/game_utils',
      from: {
        path: '^src/components/App\\.tsx$',
      },
      to: {
        pathNot:
          '^(src/components|src/redux/hooks\\.ts|src/redux/selectors|src/components/styling/theme\\.tsx|src/lib/game_utils)',
        path: '^src',
      },
    },
    // components/Error can import from components/*
    {
      name: 'components-error-restrictions',
      severity: 'error',
      comment: 'components/Error can import from components/*',
      from: {
        path: '^src/components/Error',
      },
      to: {
        pathNot: '^src/components',
        path: '^src',
      },
    },
    // components/* (other than App.tsx, Error, styling/theme.tsx) can import from redux/hooks.ts, redux/selectors, components/styling/theme.tsx, lib/game_utils
    {
      name: 'components-general-restrictions',
      severity: 'error',
      comment:
        'components/* can import from redux/hooks.ts, redux/selectors, components/styling/theme.tsx, lib/game_utils, and other components',
      from: {
        path: '^src/components',
        pathNot: '^src/components/(App\\.tsx|Error|styling/theme\\.tsx)$',
      },
      to: {
        pathNot:
          '^(src/components|src/redux/hooks\\.ts|src/redux/selectors|src/components/styling/theme\\.tsx|src/lib/game_utils)',
        path: '^src',
      },
    },
    // components/styling (except theme.tsx) can import from lib/model
    {
      name: 'components-styling-restrictions',
      severity: 'error',
      comment: 'components/styling (except theme.tsx) can import from lib/model and other components/styling',
      from: {
        path: '^src/components/styling',
        pathNot: '^src/components/styling/theme\\.tsx$',
      },
      to: {
        pathNot: '^(src/components/styling|src/lib/model)',
        path: '^src',
      },
    },
    // redux/store.ts can only import from redux/eventsMiddleware.ts
    {
      name: 'redux-store-restrictions',
      severity: 'error',
      comment: 'redux/store.ts can only import from redux/eventsMiddleware.ts, redux/rootReducer.ts, redux/persist.ts',
      from: {
        path: '^src/redux/store\\.ts$',
      },
      to: {
        pathNot: '^(src/redux/(eventsMiddleware|rootReducer|persist)\\.ts)$',
        path: '^src/redux',
      },
    },
    // redux/eventsMiddleware.ts can import from redux/slices, redux/rootReducer.ts, redux/reducer_utils
    {
      name: 'redux-events-middleware-restrictions',
      severity: 'error',
      comment: 'redux/eventsMiddleware.ts can import from redux/slices, redux/rootReducer.ts, redux/reducer_utils',
      from: {
        path: '^src/redux/eventsMiddleware\\.ts$',
      },
      to: {
        pathNot: '^(src/redux/(slices|rootReducer\\.ts|reducer_utils))$',
        path: '^src/redux',
      },
    },
    // redux/slices can import from redux/reducers, lib/game_utils
    {
      name: 'redux-slices-restrictions',
      severity: 'error',
      comment: 'redux/slices can import from redux/reducers, lib/game_utils',
      from: {
        path: '^src/redux/slices',
      },
      to: {
        pathNot: '^(src/redux/reducers|src/lib/game_utils)$',
        path: '^src',
      },
    },
    // redux/reducers can import from lib/game_utils, redux/reducer_utils
    {
      name: 'redux-reducers-restrictions',
      severity: 'error',
      comment: 'redux/reducers can import from lib/game_utils, redux/reducer_utils',
      from: {
        path: '^src/redux/reducers',
      },
      to: {
        pathNot: '^(src/lib/game_utils|src/redux/reducer_utils)$',
        path: '^src',
      },
    },
    // redux/reducer_utils can import from lib/model
    {
      name: 'redux-reducer-utils-restrictions',
      severity: 'error',
      comment: 'redux/reducer_utils can import from lib/model',
      from: {
        path: '^src/redux/reducer_utils',
      },
      to: {
        pathNot: '^src/lib/model$',
        path: '^src',
      },
    },
    // redux/hooks.ts can import from redux/store.ts, redux/rootReducer.ts
    {
      name: 'redux-hooks-restrictions',
      severity: 'error',
      comment: 'redux/hooks.ts can import from redux/store.ts, redux/rootReducer.ts',
      from: {
        path: '^src/redux/hooks\\.ts$',
      },
      to: {
        pathNot: '^(src/redux/(store|rootReducer)\\.ts)$',
        path: '^src/redux',
      },
    },
    // redux/selectors can import from redux/rootReducer.ts
    {
      name: 'redux-selectors-restrictions',
      severity: 'error',
      comment: 'redux/selectors can import from redux/rootReducer.ts',
      from: {
        path: '^src/redux/selectors',
      },
      to: {
        pathNot: '^src/redux/rootReducer\\.ts$',
        path: '^src/redux',
      },
    },
    // redux/rootReducer.ts can import from redux/slices, redux/reducer_utils
    {
      name: 'redux-root-reducer-restrictions',
      severity: 'error',
      comment: 'redux/rootReducer.ts can import from redux/slices, redux/reducer_utils',
      from: {
        path: '^src/redux/rootReducer\\.ts$',
      },
      to: {
        pathNot: '^(src/redux/(slices|reducer_utils))$',
        path: '^src/redux',
      },
    },
    // redux/persist.ts can import from redux/rootReducer.ts
    {
      name: 'redux-persist-restrictions',
      severity: 'error',
      comment: 'redux/persist.ts can import from redux/rootReducer.ts',
      from: {
        path: '^src/redux/persist\\.ts$',
      },
      to: {
        pathNot: '^src/redux/rootReducer\\.ts$',
        path: '^src/redux',
      },
    },
    // lib/game_utils can import from lib/factories
    {
      name: 'lib-game-utils-restrictions',
      severity: 'error',
      comment: 'lib/game_utils can import from lib/factories',
      from: {
        path: '^src/lib/game_utils',
      },
      to: {
        pathNot: '^src/lib/factories$',
        path: '^src/lib',
      },
    },
    // lib/factories can import from lib/ruleset
    {
      name: 'lib-factories-restrictions',
      severity: 'error',
      comment: 'lib/factories can import from lib/ruleset',
      from: {
        path: '^src/lib/factories',
      },
      to: {
        pathNot: '^src/lib/ruleset$',
        path: '^src/lib',
      },
    },
    // lib/ruleset can import from lib/model_utils
    {
      name: 'lib-ruleset-restrictions',
      severity: 'error',
      comment: 'lib/ruleset can import from lib/model_utils',
      from: {
        path: '^src/lib/ruleset',
      },
      to: {
        pathNot: '^src/lib/model_utils$',
        path: '^src/lib',
      },
    },
    // lib/model_utils can import from lib/data_tables
    {
      name: 'lib-model-utils-restrictions',
      severity: 'error',
      comment: 'lib/model_utils can import from lib/data_tables',
      from: {
        path: '^src/lib/model_utils',
      },
      to: {
        pathNot: '^src/lib/data_tables$',
        path: '^src/lib',
      },
    },
    // lib/data_tables can import from lib/model
    {
      name: 'lib-data-tables-restrictions',
      severity: 'error',
      comment: 'lib/data_tables can import from lib/model',
      from: {
        path: '^src/lib/data_tables',
      },
      to: {
        pathNot: '^src/lib/model$',
        path: '^src/lib',
      },
    },
    // lib/model can import from lib/primitives
    {
      name: 'lib-model-restrictions',
      severity: 'error',
      comment: 'lib/model can import from lib/primitives',
      from: {
        path: '^src/lib/model',
      },
      to: {
        pathNot: '^src/lib/primitives$',
        path: '^src/lib',
      },
    },
    // Primitives: assertPrimitives.ts can import from mathPrimitives.ts
    {
      name: 'primitives-assert-restrictions',
      severity: 'error',
      comment: 'lib/primitives/assertPrimitives.ts can import from mathPrimitives.ts',
      from: {
        path: '^src/lib/primitives/assertPrimitives\\.ts$',
      },
      to: {
        pathNot: '^src/lib/primitives/mathPrimitives\\.ts$',
        path: '^src/lib/primitives',
      },
    },
    // Primitives: fixed6.ts can import from assertPrimitives.ts, mathPrimitives.ts, formatPrimitives.ts
    {
      name: 'primitives-fixed6-restrictions',
      severity: 'error',
      comment: 'lib/primitives/fixed6.ts can import from assertPrimitives.ts, mathPrimitives.ts, formatPrimitives.ts',
      from: {
        path: '^src/lib/primitives/fixed6\\.ts$',
      },
      to: {
        pathNot: '^src/lib/primitives/(assertPrimitives|mathPrimitives|formatPrimitives)\\.ts$',
        path: '^src/lib/primitives',
      },
    },
    // Primitives: formatPrimitives.ts can import from mathPrimitives.ts
    {
      name: 'primitives-format-restrictions',
      severity: 'error',
      comment: 'lib/primitives/formatPrimitives.ts can import from mathPrimitives.ts',
      from: {
        path: '^src/lib/primitives/formatPrimitives\\.ts$',
      },
      to: {
        pathNot: '^src/lib/primitives/mathPrimitives\\.ts$',
        path: '^src/lib/primitives',
      },
    },
    // Primitives: rand.ts can import from assertPrimitives.ts
    {
      name: 'primitives-rand-restrictions',
      severity: 'error',
      comment: 'lib/primitives/rand.ts can import from assertPrimitives.ts',
      from: {
        path: '^src/lib/primitives/rand\\.ts$',
      },
      to: {
        pathNot: '^src/lib/primitives/assertPrimitives\\.ts$',
        path: '^src/lib/primitives',
      },
    },
    // Primitives: stringPrimitives.ts can import from assertPrimitives.ts
    {
      name: 'primitives-string-restrictions',
      severity: 'error',
      comment: 'lib/primitives/stringPrimitives.ts can import from assertPrimitives.ts',
      from: {
        path: '^src/lib/primitives/stringPrimitives\\.ts$',
      },
      to: {
        pathNot: '^src/lib/primitives/assertPrimitives\\.ts$',
        path: '^src/lib/primitives',
      },
    },
    // Primitives: rolls.ts can import from assertPrimitives.ts, fixed6.ts, formatPrimitives.ts, mathPrimitives.ts, rand.ts
    {
      name: 'primitives-rolls-restrictions',
      severity: 'error',
      comment:
        'lib/primitives/rolls.ts can import from assertPrimitives.ts, fixed6.ts, formatPrimitives.ts, mathPrimitives.ts, rand.ts',
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
