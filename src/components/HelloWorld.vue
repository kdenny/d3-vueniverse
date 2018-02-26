<template>
  <div class="hello">
    <h1 style="margin-bottom: 25px;">Feature Analytics Dashboard</h1>
    <div class="row" style="height: 560px">
      <div class="col-md-3">
        <h3>Publishers by Usage Frequency</h3>
        <h4 v-if="universeSize > 1">Avg Usage Per Publisher: <span class="stat-number">{{ stats.avgUsage }}</span> custom fields</h4>
        <h4 v-if="universeSize == 1">{{ pubList[0].publisher }} Usage: <span class="stat-number">{{ stats.avgUsage }}</span> custom fields</h4>
        <ul>
          <li style="font-size: 18pt; margin-top: 5px;" ></li>
          <li style="font-size: 18pt; margin-top: 5px;" v-if="universeSize == 1"></li>
        </ul>
        <!--<publisher_usage :width="width" :height="height" :margin="margin2" v-if="usageByPub"-->
                   <!--:xVar="xVar2" :yVar="yVar2"-->
                   <!--:apiLoc="apiLoc" :chartData="usageByPub.data" :xScale="usageByPub.xScale"-->
                   <!--v-on:barClicked="binBarClicked"-->
                   <!--:selectedBar="selectedBar2"-->
                   <!--style="display: block; position: absolute; z-index: 2; margin-top: 25px; margin-left: 75px;"/>-->
        <publisher_dot :width="width" :height="height" :margin="margin2" v-if="usageByPub"
                         :xVar="xVar2" :yVar="yVar2"
                         :apiLoc="apiLoc" :chartData="usageByPub.data" :xScale="usageByPub.xScale"
                         v-on:barClicked="binBarClicked"
                         :selectedBar="selectedBar2"
                         style="display: block; position: absolute; z-index: 2; margin-top: 25px; margin-left: 75px;"/>
      </div>
      <div class="col-md-6">
        <h3>Usage Scope</h3>
        <div class="span" style="font-size: 18px; font-weight: bold; margin-top: 20px;"> {{ universeSize }} out of {{ stats.totalPublishers }} publishers selected <span class="reset" v-if="reset" v-on:click="doReset()">(reset)</span></div>
        <ul class="big-stats">
          <li class="big-stat">Total Custom Fields created: <span class="stat-number">{{ stats.totalUsage }}</span></li>
          <!--<li class="big-stat">Total Views to Custom Fields page: <span class="stat-number">{{ stats.totalViews }}</span></li>-->
          <li class="big-stat">Publishers using feature: {{ stats.totalPublishers }} / {{ stats.globalPublishers }} <span class="stat-number">({{ stats.adoptionRate }}%)</span></li>
        </ul>
        <scale_chart :width="width3" :height="height3" :margin="margin3"
                   style="display: block; z-index: 2; margin-left: 50px;"/>
      </div>

      <div class="col-md-3">
        <h3>Usage over Time</h3>
        <h4 v-if="universeSize > 1">for {{ universeSize }} publishers</h4>
        <h4 v-if="universeSize == 1">for {{ pubList[0].publisher }} </h4>
        <month_bar :width="width" :height="height" :margin="margin2" v-if="usageByMonth"
        :xVar="xVar" :yVar="yVar"
        :apiLoc="apiLoc" :chartData="usageByMonth.data" :xScale="usageByMonth.xScale"
        v-on:barClicked="monthBarClicked"
        :selectedBar="selectedBar"
        style="display: block; position: absolute; z-index: 2; margin-top: 55px; margin-left: 25px;"/>
      </div>
    </div>

    <div class="row" v-if="tableData" style="margin-top: 5px">

      <div class="col-md-3">
        <h3>Publisher Markets</h3>
        <div v-if="marketData">
          <ul style="margin-top: 30px">
            <li v-for="mh in marketData" style="display: inline-block; height: 55px;"><span :class="filterClass('market',mh)" v-on:click="filterClicked('market',mh.key)">{{ mh.key }} &nbsp; {{ mh.rel_percent }}</span></li>
          </ul>
        </div>

        <div v-if="rawTree">
          <tree-map :treeData="rawTree" v-on:cellClicked="cellClicked"></tree-map>
        </div>
      </div>

      <div class="col-md-6">
        <h3>Publisher Activity</h3>
        <table class="table" v-if="pubList" style="margin-top: 40px">
          <thead>
          <tr>
            <th v-for="tf in pubHeaders" class="table-head-row">{{ tf }}</th>
            <th class="table-head-row"></th>
          </tr>
          </thead>
          <tbody>
            <tr v-for="rowd in tableData" class="pub-data">
              <!--<td v-for="tg in tableFields">{{ rowd[tg.name] }}</td>-->
              <td><strong>{{ rowd.publisher }}</strong></td>
              <td>{{ rowd.usage }}</td>
              <td style="width: 35%"><button class="btn-primary" v-on:click="listActivity(rowd.publisher)">Show Activity</button>
                <div v-if="rowd.clicked" style="height: 125px;">
                  Display all fields created here
                </div>
                <div v-if="!rowd.clicked" style="height: 10px">
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="col-md-3">
        <h3>Publisher Integration Types</h3>
        <div v-if="integrationData">
          <ul style="margin-top: 30px;">
            <li v-for="ig in integrationData" style="display: block; height: 55px;"><span :class="filterClass('integration',ig)" v-on:click="filterClicked('integration',ig.key)">{{ ig.key }} &nbsp; {{ ig.rel_percent }}</span></li>
          </ul>
        </div>
      </div>

    </div>

  </div>
</template>

<script>

  import * as d3 from 'd3'
  import * as universe from 'universe'
  import * as moment from 'moment'

  import TreeMap from './charts/TreeMap.vue'
  import MonthBar from './charts/MonthBar.vue'
  import PublisherUsageBar from './charts/PublisherUsageBar.vue'
  import PublisherUsageDot from './charts/PublisherUsageDot.vue'
  import BootstrapTable from './charts/BootstrapTable.vue'
  import ScaleChart from './charts/ScaleChart.vue'
  import * as featureData from './fake_data.js'
export default {
  name: 'HelloWorld',
  components: {
    TreeMap,
    month_bar: MonthBar,
    publisher_usage: PublisherUsageBar,
    publisher_dot: PublisherUsageDot,
    bootstrap_table: BootstrapTable,
    scale_chart: ScaleChart
  },
  computed: {
    tableData() {
      let m = this.pubList.sort(function(a, b) {
        return b.usage - a.usage;
      })
      return this.pubList
    }
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      tdata: {},
      width: 450,
      width3: 500,
      height3: 85,
      height: 400,
      margin: {top: 50, right: 10, bottom: 100, left: 0},
      margin2: {top: 15, right: 10, bottom: 100, left: 80},
      margin3: {top: 0, right: 10, bottom: 10, left: 10},
      xVar: "key",
      yVar: "usage",
      xVar2: "key",
      yVar2: "count",
      apiLoc: "http://nimbuscharts.pythonanywhere.com/sheets/1fVQ13aXacNsHOSIL85Jv1LTT9p3bao2kFh1mCEmsdPU/API_data/",
      chartData: null,
      treeData: {},
      rawTree: null,
      myUniverse: null,
      currentUsageBin: [],
      barQuery: null,
      selectedBar: null,
      selectedBar2: null,
      tableHeaders: null,
      selectedCell: null,
      reset: false,
      formattedData: [],
      stats: {
        totalViews: 107,
        totalUsage: 0,
        totalPublishers: 0,
        avgUsage: null,
        globalPublishers: 147
      },
      pubList: null,
      pubHeaders: ['publisher', 'usage'],
      usageByMonth: null,
      pubUsageBins: {},
      timeScale: ['None','1-2','3-5','6-10','10-20','20+'],
      pubMarkets: {},
      clicked: {},
      marketData: null,
      pubIntegrations: {},
      integrationData: null,
      selectedFilters: {
        integration: null,
        market: null
      },
      usageByPub: null,
      fData: featureData.featureData.data,
      universeSize: null
    }
  },
  mounted () {
    var me = this;
    let rawData = this.fData
    this.formattedData = rawData.data.map(f => {
      f.usage = +f['usage']
      f.usageBin = me.binUsage(f.usage)
      f.mo = f['month']
      return f
    })
    universe(this.formattedData)
      .then(function(myUniverse){

        myUniverse.onFilter(me.pandemonium, 300);
        myUniverse.query({
          groupBy: 'month',
          select: {
            $count: true, // Count the number of records
            sumUsage: { // Create a custom 'quantity' column
              $sum: 'usage' // Sum the quantity column
            }
          },
          chart: 'bar',
          displayName: 'Usage by Month'
        })
        .then(function(res) {
          const g = res.data
          let gd = g.map(u => {
            u.usage = u.value.sumUsage.sum
            me.stats.totalUsage += u.usage
            return u
          })
          me.usageByMonth = {xScale: ['2017-10', '2017-11', '2017-12', '2018-01', '2018-02'], data: gd, filter: false}
        })


        myUniverse.query({
          groupBy: 'pub',
          select: {
            $count: true,
            sumUsage: { // Create a custom 'quantity' column
              $sum: 'usage' // Sum the quantity column
            }
          },
          chart: 'bar',
          displayName: 'Content Age'
        }).then(function (res) {
          let h = res.data
          let grp = {}
          me.rawTree = []
          me.pubList = []
          let hd = h.map(u => {
            let j = {name: u.key, value: u.value.sumUsage.sum}
            me.rawTree.push(j)
            let mc = {publisher: u.key, usage: u.value.sumUsage.sum, clicked: false}
            me.pubList.push(mc)
            me.clicked[u.key] = false
            u.usage = me.binUsage(u.value.sumUsage.sum)
            if (grp[u.usage]) {
              grp[u.usage] += 1
            } else {
              grp[u.usage] = 1
            }
            if (me.pubUsageBins[u.usage]) {
              me.pubUsageBins[u.usage].push(u.key)
            } else {
              me.pubUsageBins[u.usage] = []
              me.pubUsageBins[u.usage].push(u.key)
            }
            return u
          })
          me.stats.totalPublishers = me.rawTree.length
          me.stats.adoptionRate = Math.round((me.stats.totalPublishers / me.stats.globalPublishers) * 1000) / 10
          me.stats.avgUsage = me.stats.totalUsage / me.stats.totalPublishers

          let xScale = ['None','1-2','3-5','6-10','10-20','20+']
          let qdata = []

          xScale.forEach(sc => {
            if (grp[sc]) {
              let mg = {
                key: sc,
                count: grp[sc]
              }
              qdata.push(mg)
            }
          })
          me.usageByPub = {data: qdata, xScale: xScale, filter: false}
          return res.universe
        })

        myUniverse.query({
          groupBy: 'market',
          select: {
            $count: true
          },
          chart: 'bar',
          displayName: 'Usage by Market'
        }).then(function(res) {
            let mk = res.data
            me.marketData = mk.map(hj => {
              me.pubMarkets[hj.key] = hj.value.count / (me.timeScale.length - 1)
              hj.rel_percent =  1
              return hj
            })
            return res.universe
          })

        myUniverse.query({
          groupBy: 'integration',
          select: {
            $count: true
          },
          chart: 'bar',
          displayName: 'Usage by Market'
        }).then(function(res) {
          let mk = res.data
          me.integrationData = mk.map(hj => {
            me.pubIntegrations[hj.key] = hj.value.count / (me.timeScale.length - 1)
            hj.rel_percent =  1
            return hj
          })
          return res.universe
        })

        me.barQuery = myUniverse
        return myUniverse
      }).then(function(myUniverse) {
      myUniverse.column('month')
        .then(function(universe) {
          var dim2 = myUniverse.column.find('month').dimension
          let oi = dim2.top(500)
//          me.tableData = oi
          me.tableHeaders = me.fData.headers
          me.universeSize = oi.length / (me.timeScale.length - 1)
        })
    })


  },
  methods: {
    doReset () {
      var me = this
      if (me.selectedBar2) {
        me.selectedBar2 = null
        let g = me.barQuery.filter("pub", null, true).then(res => {
          me.barQuery = res;
          me.reset = false
        })
      }
      if (me.selectedBar) {
        me.selectedBar = null
        let g = me.barQuery.filter("month", null, true).then(res => {
          me.barQuery = res;
          me.reset = false
        })
      }
      if (me.selectedCell) {
        me.selectedCell = null
        let g = me.barQuery.filter("pub", null, true).then(res => {
          me.barQuery = res;
          me.reset = false
        })
      }
      if (me.selectedFilters) {
        if (me.selectedFilters.integration) {
          let g = this.barQuery.filter('integration', null, true).then(res => {
            this.barQuery = res;
            me.reset = false
          })
          me.selectedFilters.integration = null
        }
        if (me.selectedFilters.market) {
          let g = this.barQuery.filter('market', null, true).then(res => {
            this.barQuery = res;
            me.reset = false
          })
          me.selectedFilters.market = null
        }
      }
    },
    binUsage (d) {
      if (d == 0) {
        return 'None'
      } else if (d <= 2) {
        return '1-2'
      } else if (d <= 5) {
        return '3-5'
      } else if (d <= 10) {
        return '6-10'
      } else if (d <= 20) {
        return '10-20'
      } else {
        return '20+'
      }
    },
    binBarClicked (bar) {
      var me = this
      let bin = null
      if (me.pubUsageBins[bar.key].length == 1) {
        bin = me.pubUsageBins[bar.key][0]
      }
      else {
        bin = me.pubUsageBins[bar.key]
      }
      if (!me.selectedBar2) {
        me.selectedBar2 = bar.key
        let g = this.barQuery.filter("pub", bin).then(res => {
          this.barQuery = res;
        })
        me.reset = true
      }
      else {
        me.selectedBar2 = null
        let g = this.barQuery.filter("pub", null).then(res => {
          this.barQuery = res;
        })
        me.reset = false
      }

    },
    monthBarClicked (bar) {
      var me = this
      const fg = bar.key
      if (!me.selectedBar) {
        me.selectedBar = bar.key
        let g = this.barQuery.filter("month", fg, true).then(res => {
          this.barQuery = res;
          me.reset = true
        })
      }
      else {
        me.selectedBar = null
        let g = this.barQuery.filter("month", null, true).then(res => {
          this.barQuery = res;
          me.reset = false
        })
      }
    },
    listActivity (rd) {
      const j = this.pubList
      this.pubList = null

      this.pubList = j.map(pl => {
        if (pl.publisher === rd) {
          if (!pl.clicked) {
            pl.clicked = true
          } else {
            pl.clicked = false
          }
        }
        return pl
      })
    },
    checkClicked (rd) {
      if (this.clicked[rd]) {
        return true
      } else {
        return false
      }
    },
    filterClass(f, el) {
      let txg = 'filter-el'
      if (this.selectedFilters) {
        if (el.rel_percent < 0.2) {
          txg += ' empty'
        } else if (el.rel_percent >= 0.2 && el.rel_percent < 0.8) {
          txg += ' partial'
        } else {
          txg += ' full'
        }

      }
      return txg
    },
    cellClicked (cell) {
      var me = this
      if (!me.selectedCell) {
        me.selectedCell = cell.id
        me.reset = true
        let g = this.barQuery.filter("pub", cell.id, true).then(res => {
          this.barQuery = res;
        })
      }
      else {
        me.selectedCell = null
        me.reset = false
        let g = this.barQuery.filter("pub", null).then(res => {
          this.barQuery = res;
        })
      }
    },
    filterClicked (filter, item) {
      var me = this
      if (!this.selectedFilters[filter]) {
        this.selectedFilters[filter] = item
        me.reset = true
        let g = this.barQuery.filter(filter, item, true).then(res => {
          this.barQuery = res;
        })
      } else {
        this.selectedFilters[filter] = null
        me.reset = false
        let g = this.barQuery.filter(filter, null).then(res => {
          this.barQuery = res;
        })
      }
    },
    pandemonium () {
      var me = this
      console.log("Pandemonium")
//      me.tableData = null
      me.usageByMonth = null
      me.usageByPub = null
      this.barQuery.query({
        groupBy: 'month',
        select: {
          sumUsage: { // Create a custom 'quantity' column
            $sum: 'usage' // Sum the quantity column
          }
        }
      })
        .then(function(res) {
          const g = res.data
          let yd = []

          g.map(yu => {
            yu.sage = yu.value.sumUsage.sum
            yd.push(yu)
          })

          me.yVar = 'sage'

          let xScale = ['2017-10', '2017-11', '2017-12', '2018-01', '2018-02']
          me.usageByMonth = {xScale: xScale, data: yd, filter: true}
          this.barQuery = res.universe
          return res.universe
        })

      this.barQuery.query({
        groupBy: 'market',
        select: {
          $count: true,
          sumUsage: { // Create a custom 'quantity' column
            $sum: 'usage' // Sum the quantity column
          }
        },

        chart: 'bar',
        displayName: 'Usage by Market'
      })
        .then(function(res) {
          const g = res.data
          me.marketData = g.map(u => {
            if (!me.selectedBar) {
              u.count = u.value.count / (me.timeScale.length - 1)
            }
            else {
              u.count = u.value.count
            }
            if (u.value.sumUsage.sum === 0) {
              u.count = 0
            }
            if (me.selectedFilters.market) {
              if (me.selectedFilters.market !== u.key) {
                u.count = 0
              }
            }
            u.rel_percent = u.count / me.pubMarkets[u.key]
            return u
          })
          return res.universe
        })

      this.barQuery.query({
        groupBy: 'integration',
        select: {
          $count: true,
          sumUsage: { // Create a custom 'quantity' column
            $sum: 'usage' // Sum the quantity column
          }
        },
        chart: 'bar',
        displayName: 'Usage by Market'
      }).then(function(res) {
        let mk2 = res.data
        me.integrationData = mk2.map(u2 => {
          console.log(u2)
          if (!me.selectedBar) {
            u2.count = u2.value.count / (me.timeScale.length - 1)
          }
          else {
            u2.count = u2.value.count
          }
          if (u2.value.sumUsage.sum === 0) {
            u2.count = 0
          }
          if (me.selectedFilters.integration) {
            console.log(u2)
            if (me.selectedFilters.integration !== u2.key) {
              u2.count = 0
            }
          }
          u2.rel_percent = u2.count / me.pubIntegrations[u2.key]
          return u2
        })
        this.barQuery = res.universe
        return res.universe
      })

      this.barQuery.query({
        groupBy: ['pub','integration','market'],
        select: {
          $count: true,
          sumUsage: { // Create a custom 'quantity' column
            $sum: 'usage' // Sum the quantity column
          }
        },
        chart: 'bar',
        displayName: 'Content Age'
      }).then(function (res) {
          let h = res.data
          let grp2 = {}
          me.stats.totalUsage = 0
          me.rawTree = []
          me.pubList = []
          let xd = h.map(x => {
            console.log(x)
            x.usage = me.binUsage(x.value.sumUsage.sum)
            if (me.selectedBar2) {
              if (x.usage === me.selectedBar2) {
                let j = {name: x.key[0], value: x.value.sumUsage.sum}
                console.log(j)
                me.rawTree.push(j)
                let mc = {publisher: x.key[0], usage: x.value.sumUsage.sum, clicked: false}
                me.pubList.push(mc)
                me.stats.totalUsage += x.value.sumUsage.sum
                if (grp2[x.usage]) {
                  grp2[x.usage] += 1
                } else {
                  grp2[x.usage] = 1
                }
              }
            } else if (me.selectedBar) {
              console.log(x)
              if (x.value.sumUsage.sum !== 0) {
                let j = {name: x.key[0], value: x.value.sumUsage.sum}
                me.rawTree.push(j)
                let mc = {publisher: x.key[0], usage: x.value.sumUsage.sum, clicked: false}
                me.pubList.push(mc)
                me.stats.totalUsage += x.value.sumUsage.sum
                if (grp2[x.usage]) {
                  grp2[x.usage] += 1
                } else {
                  grp2[x.usage] = 1
                }
              }
            } else {
              let keep = true
              console.log(x)
              if (me.selectedFilters.market) {
                if (me.selectedFilters.market !== x.key[2]) {
                  keep = false
                }
              }
              if (me.selectedFilters.integration) {
                if (me.selectedFilters.integration !== x.key[1]) {
                  keep = false
                }
              }
              if (me.selectedCell) {
                console.log(me.selectedCell)
                if (me.selectedCell !== x.key[0]) {
                  keep = false
                }
              }
              if (keep) {
                if (grp2[x.usage]) {
                  grp2[x.usage] += 1
                } else {
                  grp2[x.usage] = 1
                }
                me.stats.totalUsage += x.value.sumUsage.sum
                let j = {name: x.key[0], value: x.value.sumUsage.sum}
                console.log(j)
                me.rawTree.push(j)
                j = {publisher: x.key[0], usage: x.value.sumUsage.sum, clicked: false}
                if (me.selectedCell) {
                  if (me.selectedCell === x.key[0]) {
                    me.pubList.push(j)
                  }
                }
                else {
                  me.pubList.push(j)
                }
              }

            }
            me.universeSize = me.pubList.length
            return x
          })
//          me.stats.totalPublishers = me.rawTree.length
          me.stats.adoptionRate = Math.round((me.stats.totalPublishers / me.stats.globalPublishers) * 1000) / 10
          me.stats.avgUsage = me.stats.totalUsage / me.rawTree.length
          let xScale = ['None','1-2','3-5','6-10','10-20','20+']
          let odata = []

          xScale.forEach(sc => {
            if (grp2[sc]) {
              let mg = {
                key: sc,
                ct: grp2[sc]
              }
              odata.push(mg)
            }
          })
          me.yVar2 = 'ct'
          me.usageByPub = {data: odata, xScale: xScale, filter: true}
//          this.barQuery = res.universe
          return res.universe
        }).then(function(myUniverse) {
        myUniverse.column('month')
          .then(function(universe) {
            var dim2 = myUniverse.column.find('month').dimension
            let oi = dim2.top(500)
//            me.tableData = oi
            me.tableHeaders = me.fData.headers
          })
      })

    }

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.big-stats {
  margin-top: 50px;
}
.big-stat {
  margin-top: 30px;
  display: block;
  height: 70px;
  font-size: 20pt;
}

.filter-el {
  border: 1px solid black;
  border-radius: 15px;
  padding: 10px;
  margin-top: 10px;
  font-size: 16pt;
  cursor: pointer;
}

.empty {
   background-color: #F0FFFF;
  opacity: .7;
  text-color: black;
 }

.partial {
  background-color: #5F9EA0;
  opacity: .5;
  text-color: black;
}

.full {
  background-color: #5F9EA0;
  text-color: white;
}

.pub-data {
  font-size: 14pt;
}

.stat-number {
  font-weight: bold;
  font-size: 24pt;
}

.reset {
  cursor: pointer;
  color: blue;
}


</style>
