export function customers (state) {
  return state.customers.map(c => ({ ...c, id: c.id }))
}
