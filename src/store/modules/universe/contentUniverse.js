import * as types from '../../mutation-types'
import * as universe from 'universe'
import * as etl from './etl'
import * as d3 from 'd3'
export const strict = false
const state = {
  universeCreated: false,
  universe: null,
  treeData: {},
  barData: []
}



const generatedColumns = {
  day: d => d3.timeFormat('%A')(d.createdDate),
  monthsAgo: d => etl.monthsAgo(d.contentCreated)
}

let cuniverse
let chartData = {
  tree: {},
  bar: []
}

const buildUniverse = function (data) {
}



const mutations = {
  [types.CREATE_UNIVERSE] (state, universe) {
    console.log(uni)
    console.log(cha)
    state.universe = uni
    state.treeData = cha.tree
    state.barData = cha.bar
  },
  [types.SELECT_FILTER] (state, filter) {
    state.currentFilter = filter
  }
}

const actions = {
  createUniverse ({ commit, state }, data) {
    let formattedData = etl.formatUniverseData(data)
    console.log(formattedData)

    universe(data, {
      generatedColumns: generatedColumns
    })
      .then(function(myUniverse){

        // myUniverse.onFilter(me.pandemonium, 100);

        myUniverse.query({
          groupBy: 'contentSection',
          select: {
            $count: true, // Count the number of records
            sumPageviews: { // Create a custom 'quantity' column
              $sum: 'pageviews' // Sum the quantity column
            }
          },
          filter: {
            pageviews: {
              $gt: 2500
            }
          },
          chart: 'tree',
          displayName: 'Content Section'
        }).then(function(res) {
            console.log(res.data)
            let y = etl.formatTree(res.data)
            console.log(y)
            chartData.tree = y
          })

        // myUniverse.query({ groupBy: 'monthsAgo',
        //   select: {
        //     $count: true, // Count the number of records
        //     sumPageviews: { // Create a custom 'quantity' column
        //       $sum: 'pageviews' // Sum the quantity column
        //     }
        //   },
        //   chart: 'bar',
        //   displayName: 'Content Age'
        // })
        //   .then(function(res) {
        //     let h  = res.data
        //     console.log(h)
        //     chartData.bar = h.map(u => {
        //       u.pageviews = u.value.sumPageviews.sum
        //       return u
        //     })
        //     console.log(chartData.bar)
        //   })

        cuniverse = myUniverse
        console.log(chartData)
        commit(types.CREATE_UNIVERSE, {
          uni: cuniverse,
          cha: chartData
        })
        return myUniverse
      })
  }
  // setFilter ({ commit, state }, filter) {
  //   filterAdblock()
  //   commit(types.SELECT_FILTER, {
  //     filter: 'adblock'
  //   })
  //   dispatch('listenSocket')
  // },
  // listenSocket ({ commit, state }) {
  //   wSocket.addEventListener('open', function (e) {
  //     self.intId = setInterval(function () {
  //       commit(types.INCREMENT_COUNT, {
  //       })
  //     }, defaultRefresh)
  //   })
  //   wSocket.addEventListener('message', function (e) {
  //     commit(types.RESET_COUNT, {
  //     })
  //     var message = JSON.parse(e.data)
  //     commit(types.UPDATE_DATA, {
  //       message: message
  //     })
  //   })
  // }
}

export default {
  state,
  mutations,
  actions
}
