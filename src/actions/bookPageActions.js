export const TOGGLE_SHOW_FILTERS = 'TOGGLE_SHOW_FILTERS'
/**
 * Toggles visibility of the filters
 */
export const toggleShowFilters = () => ({
  type: TOGGLE_SHOW_FILTERS
})

/**
 * Signals that the filters form has been updated,
 * prompting the displayed results to update
 */
export const UPDATE_FILTERS = 'UPDATE_FILTERS'
export const updateFilters = (values) => {
  return {
    type: UPDATE_FILTERS,
    data: values,
  }
}