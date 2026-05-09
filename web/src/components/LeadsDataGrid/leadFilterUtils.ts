import type { LeadsFilterType } from '../../redux/slices/selectionSlice'

export function normalizeLeadsFilterType(filterType: unknown): LeadsFilterType {
  if (filterType === 'past') {
    return 'archived'
  }
  if (filterType === 'inactive' || filterType === 'archived') {
    return filterType
  }
  return 'active'
}
