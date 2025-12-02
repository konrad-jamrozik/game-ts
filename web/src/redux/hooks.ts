// This file serves as a central hub for re-exporting pre-typed Redux hooks.
// These imports are restricted elsewhere to ensure consistent
// usage of typed hooks throughout the application.
// We disable the ESLint rule here because this is the designated place
// for importing and re-exporting the typed versions of hooks.
// See also: https://github.com/reduxjs/redux-templates/blob/master/packages/vite-template-redux/src/app/hooks.ts
// mentioned from: https://redux.js.org/tutorials/essentials/part-2-app-structure
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from './store'
import type { RootState } from './types'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
