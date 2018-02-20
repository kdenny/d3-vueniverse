import * as types from '../../mutation-types'
// import dashboard from './dashboard'
// import pageviews from './pageviews'
// import composer from './composer'
import checkout from './checkout'
import pageviews2 from './pageviews_2'


// import ui from './ui'
// import maps from './maps'
// import tables from './tables'
// import extra from './extra'

const state = {
  items: [
    // pageviews,
    // dashboard,
    pageviews2,
    // statistics,
    // composer,
    checkout
    // contentExplorer
    // tables,
    // ui,
    // extra,
    // maps
  ]
}

const mutations = {
  [types.TOGGLE_EXPAND_MENU_ITEM] (state, payload) {
    let menuItem = payload.menuItem
    let expand = payload.expand
    if (menuItem.children && menuItem.meta) {
      menuItem.meta.expanded = expand
    }
  }
}

const actions = {
  toggleExpandMenuItem ({commit}, payload) {
    commit(types.TOGGLE_EXPAND_MENU_ITEM, payload)
  }
}

export default {
  state,
  mutations,
  actions
}
