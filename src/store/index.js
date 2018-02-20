import Vue from 'vue'
import Vuex from 'vuex'

import contentUniverse from './modules/universe/contentUniverse'
import * as getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  strict: true, // process.env.NODE_ENV !== 'production',
  getters,
  modules: {
    contentUniverse
  },
  state: {},
  mutations: {}
})

// Vue.use(VuexI18n.plugin, store)

export default store
