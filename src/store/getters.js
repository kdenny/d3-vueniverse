// const universe = state => state.universe.universe
// const treeData = state => state.universe.treeData
// const barData = state => state.universe.barData

const universe = (state) => {
  return state.universe
}

const treeData = (state) => {
  return state.treeData
}

const barData = (state) => {
  return state.barData
}

export {
  universe,
  treeData,
  barData
}
