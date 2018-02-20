<template>
  <div class="hello">
    <!--<h1>{{ msg }}</h1>-->
    <!--<h2>Essential Links</h2>-->
    <div class="row">
      <div v-if="rawTree" class="col-md-7">
        <h3>Content Sections</h3>
        <tree-map :treeData="rawTree" v-on:cellClicked="cellClicked"></tree-map>
      </div>
      <div v-if="bdata" class="col-md-5">
        <h3>Content Age</h3>
        <bar_chart :width="width" :height="height" :margin="margin2"
                   :xVar="xVar" :yVar="yVar"
                   :apiLoc="apiLoc" :chartData="bdata"
                   v-on:barClicked="barClicked"
                   :selectedBar="selectedBar"
                   style="display: block; position: absolute; background-color: wheat; z-index: 2; margin-top: 75px; margin-left: 75px;"/>
      </div>
    </div>
    <div class="row" v-if="tableData">
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
export default {
  name: 'HelloWorld',
  components: {
    TreeMap,
    bar_chart: BarChart,
    bootstrap_table: BootstrapTable
  },
  computed: {
    barData() {
      console.log(this.$store.getters)
      return this.$store.getters.treeData
    }
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
      yVar: "pageviews",
      apiLoc: "http://nimbuscharts.pythonanywhere.com/sheets/1fVQ13aXacNsHOSIL85Jv1LTT9p3bao2kFh1mCEmsdPU/API_data/",
      chartData: null,
      treeData: {},
      bdata: null,
      rawTree: null,
      myUniverse: null,
      barQuery: null,
      selectedBar: null,
      tableHeaders: null,
      tableData: null,
      uData: fileData.contentData
    }
  },
  mounted () {
    var me = this;
    console.log(this.uData)
    const generatedColumns = {
      day: d => d3.timeFormat('%A')(d.createdDate),
      monthsAgo: d => this.monthsAgo(d.contentCreated)
    }

//    d3.json("http://127.0.0.1:8000/content_api/", function (error, rawData) {
    let rawData = this.uData
    me.$store.dispatch('createUniverse', {
      data: rawData
    })
    let index = 0
    let formattedData = rawData.data.data.map(f => {
      f.pageviews = f['# of Pageviews']
      f.createdDate = me.parseDate(f.contentCreated)
      f.sessions = f['Unique Sessions']
      f.browsers = f['Unique Browsers']
      return f
    })
    universe(formattedData, {
      generatedColumns: generatedColumns
    })
      .then(function(myUniverse){

        myUniverse.onFilter(me.pandemonium, 100);

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
        })
        .then(function(res) {
          const g = res.data
          me.rawTree = g

        })

        myUniverse.query({ groupBy: 'monthsAgo',
          select: {
            $count: true, // Count the number of records
            sumPageviews: { // Create a custom 'quantity' column
              $sum: 'pageviews' // Sum the quantity column
            }
          },
          chart: 'bar',
          displayName: 'Content Age'
        })
          .then(function(res) {
            let h  = res.data
            me.bdata = h.map(u => {
              u.pageviews = u.value.sumPageviews.sum
              return u
            })
          })

        // main data list

        me.barQuery = myUniverse
        return myUniverse

      }).then(function(myUniverse) {
      myUniverse.column('createdDate')
        .then(function(universe) {
          var dim = myUniverse.column.find('createdDate').dimension
          let g = dim.top(100)
          me.tableData = g
          me.tableHeaders = ['url', 'pageviews', 'contentAuthor', 'contentSection', 'contentCreated', 'browsers']
//            list.each(render);
          // console.log(universe.cf.size())
//            d3.select('#total').text(universe.cf.size())
        })
    })


//    })
  },
  methods: {
    parseDate (d) {
      let y = new Date(d.substring(0, 4),
        d.substring(5, 7),
        d.substring(8, 10))
      return y;
    },
    monthsAgo(d) {
      let h = moment(d, "YYYY-MM-DD").fromNow().replace(" ago","").replace("a ", "1 ")
      let bin = null
      if (h.includes('year')) {
        let df = h.substring(0,2)
        if (df == 1) {
          bin = "1 yr"
        }
        if (df == 2) {
          bin = "2 yr"
        }
        if (df >= 3) {
          bin = "> 3 yr"
        }
      } else {
        let df = Number(h.substring(0,2))
        if (df == 1) {
          bin = "1 mo"
        } else if (df == 2) {
          bin = "2 mo"
        } else if (df >= 3 && df <= 6) {
          bin = "3-6 mo"
        } else if (df >= 7 && df <= 12) {
          bin = "6-12 mo"
        }
      }
      return bin
    },
    barClicked (bar) {
      console.log(bar)
      this.rawTree = null
      let g = this.barQuery.filter("monthsAgo", bar.key, true).then(res => {
        console.log(res)
        this.barQuery = res;
      })
//      console.log(g)
//      console.log(this.barQuery)
    },
    cellClicked (cell) {
      console.log(cell)
      this.bdata = null
      let g = this.barQuery.filter("contentSection", cell.id, true).then(res => {
        this.barQuery = res;
      })
    },
    pandemonium () {
//      this.bdata = null
      var me = this
      me.tableData = null
      this.barQuery.query({
        groupBy: 'contentSection',
        select: {
          $count: true, // Count the number of records
          sumPageviews: { // Create a custom 'quantity' column
            $sum: 'pageviews' // Sum the quantity column
          }
        },
//        filter: {
//          pageviews: {
//            $gt: 2500
//          }
//        },
        chart: 'tree',
        displayName: 'Content Section'
      })
        .then(function(res) {
          const g = res.data
          me.rawTree = g
        })

      this.barQuery.query({ groupBy: 'monthsAgo',
        select: {
          $count: true, // Count the number of records
          sumPageviews: { // Create a custom 'quantity' column
            $sum: 'pageviews' // Sum the quantity column
          }
        },
        chart: 'bar',
        displayName: 'Content Age'
      })
        .then(function(res) {
          let h  = res.data
          me.bdata = h.map(u => {
            u.pageviews = u.value.sumPageviews.sum
            return u
          })
          console.log(me.bdata)

          return res.universe
        }).then(function(myUniverse) {
          myUniverse.column('createdDate')
            .then(function(universe) {
              var dim = universe.column.find('createdDate').dimension
              me.tableData = dim.top(100)
              me.tableHeaders = ['url', 'pageviews', 'contentAuthor', 'contentSection', 'contentCreated', 'browsers']
              console.log(me.tableData)
              console.log(me.tableHeaders)
  //              list.each(render);
  //              // console.log(universe.cf.size())
  //              d3.select('#total').text(universe.cf.size())
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
