<template>
  <div class="hello">
    <!--<h1>{{ msg }}</h1>-->
    <!--<h2>Essential Links</h2>-->
    <div class="span" style="font-size: 18px; font-weight: bold;"> {{ universeSize }} out of {{ formattedData.length }} records selected</div>
    <div class="row" style="height: 550px">
      <div class="col-md-3">
        <h3>Usage By Publisher</h3>
        <bar_chart :width="width" :height="height" :margin="margin2" v-if="usageByPub"
                   :xVar="xVar2" :yVar="yVar2"
                   :apiLoc="apiLoc" :chartData="usageByPub.data" :xScale="usageByPub.xScale"
                   v-on:barClicked="binBarClicked"
                   :selectedBar="selectedBar"
                   style="display: block; position: absolute; background-color: wheat; z-index: 2; margin-top: 75px; margin-left: 75px;"/>
      </div>
      <div class="col-md-6">
        <h3>Usage Scope</h3>
      </div>
      <div class="col-md-3">
        <h3>Usage over Time</h3>
        <bar_chart :width="width" :height="height" :margin="margin2" v-if="usageByMonth"
        :xVar="xVar" :yVar="yVar"
        :apiLoc="apiLoc" :chartData="usageByMonth.data" :xScale="usageByMonth.xScale"
        v-on:barClicked="monthBarClicked"
        :selectedBar="selectedBar"
        style="display: block; position: absolute; background-color: wheat; z-index: 2; margin-top: 75px; margin-left: 75px;"/>
      </div>
    </div>
    <!--<div class="row">-->
      <!--<div v-if="!rawTree" class="col-md-7" style="height: 650px">-->
        <!--<h3>Content Sections</h3>-->
      <!--</div>-->
      <!--<div v-if="rawTree" class="col-md-7">-->
        <!--<h3>Content Sections</h3>-->
        <!--<tree-map :treeData="rawTree" v-on:cellClicked="cellClicked"></tree-map>-->
      <!--</div>-->
      <!--<div v-if="bdata" class="col-md-5">-->
        <!--<h3>Content Age</h3>-->
        <!--<bar_chart :width="width" :height="height" :margin="margin2"-->
                   <!--:xVar="xVar" :yVar="yVar"-->
                   <!--:apiLoc="apiLoc" :chartData="bdata"-->
                   <!--v-on:barClicked="barClicked"-->
                   <!--:selectedBar="selectedBar"-->
                   <!--style="display: block; position: absolute; background-color: wheat; z-index: 2; margin-top: 75px; margin-left: 75px;"/>-->
      <!--</div>-->
    <!--</div>-->
    <div class="row" v-if="tableData" style="max-width: 80vw; margin-left: 8vw;">
      <bootstrap_table
        :tableFields="tableHeaders"
        :tableRows="tableData"
      ></bootstrap_table>
    </div>

  </div>
</template>

<script>

  import * as d3 from 'd3'
  import * as universe from 'universe'
  import * as moment from 'moment'

  import TreeMap from './TreeMap.vue'
  import BarChart from './bar.vue'
  import BootstrapTable from './BootstrapTable.vue'
  import * as fileData from './out.js'
  import * as featureData from './fake_data.js'
export default {
  name: 'HelloWorld',
  components: {
    TreeMap,
    bar_chart: BarChart,
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
      barQuery: null,
      selectedBar: null,
      tableHeaders: null,
      formattedData: [],
      usageByMonth: null,
      pubUsageBins: {},
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
            return u
          })
          me.usageByMonth = {xScale: ['2017-10', '2017-11', '2017-12', '2018-01', '2018-02'], data: gd}
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
          let h = res.data
          let grp = {}
          let hd = h.map(u => {
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

          let xScale = ['None','1-2','3-5','6-10','10-20','20+']
          let odata = []

          xScale.forEach(sc => {
            if (grp[sc]) {
              let mg = {
                key: sc,
                count: grp[sc]
              }
              odata.push(mg)
            }
          })
          me.usageByPub = {data: odata, xScale: xScale}
        })
        me.barQuery = myUniverse
        return myUniverse

      }).then(function(myUniverse) {
      myUniverse.column('pub')
        .then(function(universe) {
          var dim = myUniverse.column.find('pub').dimension
          let g = dim.top(100)
          me.tableData = g
          me.tableHeaders = me.fData.headers
          me.universeSize = myUniverse.cf.size()
        })
    })

  },
  methods: {
    parseDate (d) {
      let y = new Date(d.substring(0, 4),
        d.substring(5, 7),
        d.substring(8, 10))
      return y;
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
      console.log(bar)
      this.rawTree = null
      let g = this.barQuery.filter("month", bar.key, true).then(res => {
        console.log(res)
        this.barQuery = res;
      })
    },
    monthBarClicked (bar) {
      console.log(bar)
      let g = this.barQuery.filter("month", bar.key, true).then(res => {
        console.log(res)
        this.barQuery = res;
      })
    },
    pandemonium () {
//      this.bdata = null
      var me = this
      console.log("Pandemonium")
//      me.tableData = null
//
      this.barQuery.query({
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
          console.log(res.data)
          const g = res.data
          let gd = g.map(u => {
            u.usage = u.value.sumUsage.sum
            return u
          })
          me.usageByMonth = {xScale: ['2017-10', '2017-11', '2017-12', '2018-01', '2018-02'], data: gd}
        })

      this.barQuery({ groupBy: 'pub',
        select: {
          $count: true,
          sumUsage: { // Create a custom 'quantity' column
            $sum: 'usage' // Sum the quantity column
          }
        },
        chart: 'bar',
        displayName: 'Content Age'
      })
        .then(function (res) {
          let h = res.data
          let grp = {}
          let hd = h.map(u => {
            u.usage = me.binUsage(u.value.sumUsage.sum)
            if (grp[u.usage]) {
              grp[u.usage] += 1
            } else {
              grp[u.usage] = 1
            }
            return u
          })

          let xScale = ['None','1-2','3-5','6-10','10-20','20+']
          let odata = []

          xScale.forEach(sc => {
            if (grp[sc]) {
              let mg = {
                key: sc,
                count: grp[sc]
              }
              odata.push(mg)
            }
          })
          me.usageByPub = {data: odata, xScale: xScale}
        }).then(function(myUniverse) {
        myUniverse.column('pub')
          .then(function(universe) {
            var dim = myUniverse.column.find('pub').dimension
            let g = dim.top(100)
            me.tableData = g
            me.tableHeaders = me.fData.headers
            me.universeSize = myUniverse.cf.size()
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


</style>
