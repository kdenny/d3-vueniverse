<template>
  <div class="hello">
    <!--<h1>{{ msg }}</h1>-->
    <!--<h2>Essential Links</h2>-->
    <div class="span" style="font-size: 18px; font-weight: bold;"> {{ universeSize }} out of {{ stats.totalPublishers }} publishers selected</div>
    <div class="row" style="height: 625px">
      <div class="col-md-3">
        <h3>Publishers by Usage Frequency</h3>
        <ul class="big-stats">
          <li>Avg Use for Publisher: {{ stats.avgUsage }} custom fields</li>
        </ul>
        <publisher_usage :width="width" :height="height" :margin="margin2" v-if="usageByPub"
                   :xVar="xVar2" :yVar="yVar2"
                   :apiLoc="apiLoc" :chartData="usageByPub.data" :xScale="usageByPub.xScale"
                   v-on:barClicked="binBarClicked"
                   :selectedBar="selectedBar2"
                   style="display: block; position: absolute; background-color: wheat; z-index: 2; margin-top: 75px; margin-left: 75px;"/>
      </div>
      <div class="col-md-6">
        <h3>Usage Scope</h3>
        <ul class="big-stats">
          <li class="big-stat">Total Views to Custom Fields page: {{ stats.totalViews }}</li>
          <li class="big-stat">Total Custom Fields created: {{ stats.totalUsage }}</li>
          <li class="big-stat">Publishers using feature: {{ stats.totalPublishers }} / {{ stats.globalPublishers }} ({{ stats.adoptionRate }}%)</li>
        </ul>

      </div>
      <div class="col-md-3">
        <h3>Usage over Time</h3>
        <month_bar :width="width" :height="height" :margin="margin2" v-if="usageByMonth"
        :xVar="xVar" :yVar="yVar"
        :apiLoc="apiLoc" :chartData="usageByMonth.data" :xScale="usageByMonth.xScale"
        v-on:barClicked="monthBarClicked"
        :selectedBar="selectedBar"
        style="display: block; position: absolute; background-color: wheat; z-index: 2; margin-top: 75px; margin-left: 75px;"/>
      </div>
    </div>
    <div class="row" v-if="tableData" style="margin-top: 25px">
      <div class="col-md-3">
        <h3>Publisher Markets</h3>
        <div v-if="marketData">
          <ul>
            <li v-for="mh in marketData" style="display: block; height: 35px;">{{ mh.key }} - {{ mh.rel_percent }}</li>
          </ul>
        </div>
        <div v-if="rawTree">
          <tree-map :treeData="rawTree" v-on:cellClicked="cellClicked"></tree-map>
        </div>
      </div>
      <div class="col-md-6">
        <bootstrap_table
          :tableFields="tableHeaders"
          :tableRows="tableData"
        ></bootstrap_table>
      </div>
      <div class="col-md-3">
        <h3>Publisher Integration Types</h3>
        <div v-if="integrationData">
          <ul>
            <li v-for="ig in integrationData" style="display: block; height: 35px;">{{ ig.key }} - {{ ig.rel_percent }}</li>
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

  import TreeMap from './TreeMap.vue'
  import BarChart from './bar.vue'
  import MonthBar from './charts/MonthBar.vue'
  import PublisherUsageBar from './charts/PublisherUsageBar.vue'
  import BootstrapTable from './BootstrapTable.vue'
  import * as fileData from './out.js'
  import * as featureData from './fake_data.js'
export default {
  name: 'HelloWorld',
  components: {
    TreeMap,
    bar_chart: BarChart,
    month_bar: MonthBar,
    publisher_usage: PublisherUsageBar,
    bootstrap_table: BootstrapTable
  },
  computed: {
//    barData() {
//      console.log(this.$store.getters)
//      return this.$store.getters.treeData
//    }
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      tdata: {},
      width: 450,
      height: 400,
      margin: {top: 50, right: 10, bottom: 100, left: 0},
      margin2: {top: 50, right: 10, bottom: 100, left: 80},
      xVar: "key",
      yVar: "usage",
      xVar2: "key",
      yVar2: "count",
      apiLoc: "http://nimbuscharts.pythonanywhere.com/sheets/1fVQ13aXacNsHOSIL85Jv1LTT9p3bao2kFh1mCEmsdPU/API_data/",
      chartData: null,
      treeData: {},
      bdata: null,
      rawTree: null,
      myUniverse: null,
      currentUsageBin: [],
      barQuery: null,
      selectedBar: null,
      selectedBar2: null,
      tableHeaders: null,
      formattedData: [],
      stats: {
        totalViews: 107,
        totalUsage: 0,
        totalPublishers: 0,
        avgUsage: null,
        globalPublishers: 147
      },
      totalViews: 107,
      totalUsage: 0,
      totalPublishers: 0,
      avgUsage: null,
      usageByMonth: null,
      pubUsageBins: {},
      timeScale: ['None','1-2','3-5','6-10','10-20','20+'],
      pubMarkets: {},
      marketData: null,
      pubIntegrations: {},
      integrationData: null,
      tableData: null,
      usageByPub: null,
      uData: fileData.contentData,
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


        myUniverse.query({ groupBy: 'pub',
          select: {
            $count: true,
            sumUsage: { // Create a custom 'quantity' column
              $sum: 'usage' // Sum the quantity column
            }
          },
          chart: 'bar',
          displayName: 'Content Age'
        }).then(function (res) {
          console.log(res.data)
          let h = res.data
          let grp = {}
          me.rawTree = []
          let hd = h.map(u => {
            console.log(u.key)
            let j = {name: u.key, value: u.value.sumUsage.sum}
            me.rawTree.push(j)
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
            console.log(res.data)
            let mk = res.data
            console.log(mk)
            me.marketData = mk.map(hj => {
              me.pubMarkets[hj.key] = hj.value.count / (me.timeScale.length - 1)
              hj.rel_percent =  1
              return hj
            })
          console.log(me.pubMarkets)
          console.log(me.marketData)
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
          console.log(res.data)
          let mk = res.data
          console.log(mk)
          me.integrationData = mk.map(hj => {
            me.pubIntegrations[hj.key] = hj.value.count / (me.timeScale.length - 1)
            hj.rel_percent =  1
            return hj
          })
          console.log(me.pubIntegrations)
          console.log(me.integrationData)
          return res.universe
        })

        me.barQuery = myUniverse
        return myUniverse
      }).then(function(myUniverse) {
      myUniverse.column('month')
        .then(function(universe) {
          var dim2 = myUniverse.column.find('month').dimension
          let oi = dim2.top(500)
          console.log(dim2)
          me.tableData = oi
          me.tableHeaders = me.fData.headers
          console.log(oi.length)
          me.universeSize = oi.length / (me.timeScale.length - 1)
        })
    })


  },
  methods: {
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
      console.log(bar)
      var me = this
      let bin = null
      if (me.pubUsageBins[bar.key].length == 1) {
        bin = me.pubUsageBins[bar.key][0]
      }
      else {
        bin = me.pubUsageBins[bar.key]
      }
      me.currentUsageBin = bin
      if (!me.selectedBar2) {
        me.selectedBar2 = bar.key
        let g = this.barQuery.filter("pub", bin).then(res => {
          this.barQuery = res;
        })
      }
      else {
        me.selectedBar2 = null
        let g = this.barQuery.filter("pub", null, true).then(res => {
          this.barQuery = res;
        })
      }

    },
    monthBarClicked (bar) {
      var me = this
      console.log(bar.key)
      const fg = bar.key
      if (!me.selectedBar) {
        me.selectedBar = bar.key
        let g = this.barQuery.filter("month", fg, true).then(res => {
          console.log(res)
          this.barQuery = res;
        })
      }
      else {
        me.selectedBar = null
        let g = this.barQuery.filter("month", null, true).then(res => {
          console.log(res)
          this.barQuery = res;
        })
      }
    },
    cellClicked (cell) {
//      console.log(cell)
//      this.bdata = null
      let g = this.barQuery.filter("pub", cell.id, true).then(res => {
        this.barQuery = res;
      })
    },
    pandemonium () {
//      this.bdata = null
      var me = this
      console.log("Pandemonium")
      me.tableData = null
      me.usageByMonth = null
      me.usageByPub = null
      console.log(this.barQuery)
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
            console.log(yu)
            yu.sage = yu.value.sumUsage.sum
            yd.push(yu)
          })

          me.yVar = 'sage'

          let xScale = ['2017-10', '2017-11', '2017-12', '2018-01', '2018-02']
          me.usageByMonth = {xScale: xScale, data: yd, filter: true}
          this.barQuery = res.universe
          return res.universe
        })
//        .then(function(universe) {
//          console.log(universe)
//          universe
//      })

      this.barQuery.query({
        groupBy: ['market'],
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
            u.rel_percent = u.count / me.pubMarkets[u.key]
            return u
          })
          console.log(me.marketData)
          console.log(me.pubMarkets)
          return res.universe
        })

      this.barQuery.query({
        groupBy: ['integration'],
        select: {
          $count: true,
          sumUsage: { // Create a custom 'quantity' column
            $sum: 'usage' // Sum the quantity column
          }
        },
        chart: 'bar',
        displayName: 'Usage by Market'
      }).then(function(res) {
        console.log(res.data)
        let mk2 = res.data
        console.log(mk2)
        me.integrationData = mk2.map(u2 => {
          if (!me.selectedBar) {
            u2.count = u2.value.count / (me.timeScale.length - 1)
          }
          else {
            u2.count = u2.value.count
          }
          if (u2.value.sumUsage.sum === 0) {
            u2.count = 0
          }
          u2.rel_percent = u2.count / me.pubIntegrations[u2.key]
          return u2
        })
        console.log(me.pubIntegrations)
        console.log(me.integrationData)
        return res.universe
      })

      this.barQuery.query({ groupBy: 'pub',
        select: {
          $count: true,
          sumUsage: { // Create a custom 'quantity' column
            $sum: 'usage' // Sum the quantity column
          }
        },
        chart: 'bar',
        displayName: 'Content Age'
      }).then(function (res) {
        console.log(res)
          let h = res.data
          let grp2 = {}
          me.rawTree = []
          let xd = h.map(x => {
            let j = {name: x.key, value: x.value.sumUsage.sum}
            me.rawTree.push(j)
            x.usage = me.binUsage(x.value.sumUsage.sum)
            if (grp2[x.usage]) {
              grp2[x.usage] += 1
            } else {
              grp2[x.usage] = 1
            }
            return x
          })

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
          console.log(odata)
          me.usageByPub = {data: odata, xScale: xScale, filter: true}
          return res.universe
        }).then(function(myUniverse) {
        myUniverse.column('month')
          .then(function(universe) {
            var dim2 = myUniverse.column.find('month').dimension
            let oi = dim2.top(500)
            console.log(dim2)
            me.tableData = oi
            me.tableHeaders = me.fData.headers
            console.log(oi.length)
            me.universeSize = oi.length / (me.timeScale.length - 1)
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
.big-stat {
  margin-top: 30px;
  display: block;
  height: 70px;
  font-size: 20pt;
}


</style>
