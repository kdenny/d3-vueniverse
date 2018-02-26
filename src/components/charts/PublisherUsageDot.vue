<!--

Based on:
  https://bl.ocks.org/shimizu/f90651541575f348a129444003a73467

Links:
  Props: https://vuejs.org/v2/guide/components.html#Passing-Data-with-Props
  Methods: https://vuejs.org/v2/guide/events.html#Method-Event-Handlers

-->

<template>
  <div>
    <!--<div id="legend"></div>-->
    <svg id="svg"></svg>
  </div>

</template>

<script>

  import * as d3 from 'd3'
  //const d3tip = require('d3-tip');

  export default {
    mounted: function() {
      console.log(this.chartData)
      console.log(this.dataset)
      this.dataset = this.chartData.map(u => {
        console.log(u)
        u.group = u.key
        u.category = 'Cat 1'
        console.log(u)
        return u
      })
      var flags = [], unique_categories = [], unique_groups=[], l = this.dataset.length, i;
      for( i=0; i<l; i++) {
        if( flags[this.dataset[i].category]) continue;
        flags[this.dataset[i].category] = true;
        unique_categories.push(this.dataset[i].category);
      }
      flags = [];
      for( i=0; i<l; i++) {
        if( flags[this.dataset[i].group]) continue;
        flags[this.dataset[i].group] = true;
        unique_groups.push(this.dataset[i].group);
      }

//      var groupScale = d3.scale.ordinal().domain(unique_groups).rangePoints([0, unique_groups.length - 1]);
      var groupScale = d3.scaleBand().domain(unique_groups).range([0, unique_groups.length])
      var categoryScale = d3.scaleBand().domain(unique_categories).range([0, unique_categories.length]);

      var color = d3.scaleOrdinal(d3.schemeCategory20);;

      var el = d3.select(this.$el).select("#svg");
      console.log(this.chartData)

      var	margin = {top: 55, right: 50, bottom: 75, left: 150},
        width = 750 - margin.left - margin.right,
        height = 465 - margin.top - margin.bottom;

      // Set the ranges
//      var	xScale = d3.scale.linear().range([50, width]);
      var	xScale = d3.scaleLinear().range([50, width]);
      var	yScale = d3.scaleLinear().range([height, 25]);

      this.chartWidth = this.width - this.margin.left - this.margin.right;
      this.chartHeight = this.height - this.margin.top - this.margin.bottom;


      this.x = d3.scaleBand().rangeRound([20, this.chartWidth], 5)

      this.y = d3.scaleLinear().range([height, 0])
      var me = this
      var xAxis = d3.axisBottom(xScale);
      var yAxis = d3.axisLeft(yScale)
        .tickFormat(function (d) {
          console.log(d)
          return unique_groups[d];
        })
        .ticks(5);

      var result = this.dataset.reduce(function(res, obj) {
        if (!(obj.group in res))
          res.__array.push(res[obj.group] = obj);
        else {
          res[obj.group].count += obj.count;
        }
        return res;
      }, {__array:[]}).__array
        .sort(function(a,b) { return b.count - a.count; });

      var me = this

      xScale.domain([0,result[0].count + 4]);
      yScale.domain([0,d3.max(me.dataset,function(d){return groupScale(d.group);})]);

      this.svg = el
        .attr("width", this.width)
        .attr("viewBox", " 0 0 " + this.width + " " + this.height)
        .attr("preserveAspectRatio", "xMidYMid")
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

      this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + me.height + ")")
        .call(xAxis);

      this.svg.append("g")
        .attr("transform", "translate(50,0)")
        .attr("class", "y axis")
        .call(yAxis);

      function generate_array(d){
        var k = 0;
        for(var j=0;j<me.dataset.length;j++){
          if(groupScale(me.dataset[j].group) == groupScale(d.group) && categoryScale(me.dataset[j].category) < categoryScale(d.category)){
            k = k + me.dataset[j].count/2;
          }
        }

        var arr = new Array(d.count);
        for(var i=0;i<d.count;i++){
          arr[i] = {y:groupScale(d.group),x:k+i/2,group:d.group,category:d.category};
        }

        return arr;
      }

      var groups = me.svg
        .selectAll("g.group")
        .data(this.dataset )
        .enter()
        .append('g')
        .attr("class", "group");

      var circleArray = groups.selectAll("g.circleArray")
        .data(function(d) {return generate_array(d);});

      circleArray.enter()
        .append('g')
        .attr("class", "circleArray")
        .append("circle")
        .style("fill",function(d){return color(d.category);})
        .attr("r", 10)
        .attr("cx", function(d,i) {return xScale(d.x) + 12; })
        .attr("cy", function(d,i) { return yScale(d.y); });

    },
    data() {
      return {
        dataset: [
          {group: "None", category: "Cat 1", count: 1},
//          {group: "None", category: "Cat 2", count: 3},
//          {group: "None", category: "Cat 3", count: 5},
//          {group: "None", category: "Cat 4", count: 4},
          {group: "1-2", category: "Cat 1", count: 6},
//          {group: "1-2", category: "Cat 2", count: 2},
          {group: "3-5", category: "Cat 1", count: 5},
//          {group: "3-5", category: "Cat 2", count: 4},
          {group: "6-10", category: "Cat 1", count: 1},
//          {group: "6-10", category: "Cat 3", count: 4},
//          {group: "6-10", category: "Cat 5", count: 2},
          {group: "10-20", category: "Cat 1", count: 6},
//          {group: "10-20", category: "Cat 4", count: 2},
//          {group: "10-20", category: "Cat 5", count: 1},
          {group: "20+", category: "Cat 1", count: 7},
//          {group: "20+", category: "Cat 2", count: 3},
//          {group: "20+", category: "Cat 3", count: 2},
//          {group: "20+", category: "Cat 4", count: 1},
//          {group: "20+", category: "Cat 5", count: 5},
//          {group: "20+", category: "Cat 6", count: 3},
        ],
        dataset2: null,
        timeScale: ['None','1-2','3-5','6-10','10-20','20+']
      }
    },
    watch: {
      chartData(newTree) {
        console.log(this.chartData)
        this.clearChart()
//      this.etl()
//      this.renderChart()
        this.drawChart(this.chartData)
      }
    },
    props: ['width', 'height', 'margin', 'apiLoc', 'xVar', 'xScale', 'yVar', 'chartData', 'selectedBar'],
    methods: {
      drawChart: function(data) {

        var me = this;

        me.y.domain([0, d3.max(me.chartData, function(d) { return d[me.yVar]; })]);
//      me.x.domain(['1 mo', '2 mo', '3-6 mo', '6-12 mo', '1 yr', '2 yr', '> 3 yr'])
        me.x.domain(me.xScale)

//      me.x.domain(me.chartData.map(function(d) { return d[me.xVar]; }));


        me.svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(me.xAxis)
          .selectAll("text")
          .style("text-anchor", "end")
          .attr("class","axis-text")
          .attr("dx", "-.8em")
          .attr("dy", "-.55em")
          .attr("transform", "rotate(-90)" );

        me.svg.append("g")
          .attr("class", "y axis")
          .call(me.yAxis)
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("class","axis-text")
          .attr("y", -50)
          .attr("x", -me.chartHeight/2)
          .attr("dy", ".71em")
          .style("text-anchor", "middle")
          .text("Conversions");

        me.svg.selectAll("bar")
          .data(me.chartData)
          .enter().append("rect")
          .attr("class", function(d) {
            if (d.key === me.selectedBar) {
              return "active"
            }
            else {
              return "bar"
            }
          })
          .on("click", function(d) {
            console.log(d)
            console.log(me.selectedBar)
            if (d3.select(this).attr("class") =='bar') {
              d3.select(this).attr("class", "active")
            }
            else {
              d3.select(this).attr("class", "bar")
            }

            me.barClicked(d)
          })
          .attr("x", function(d) {
            return me.x(d[me.xVar]);
          })
          .attr("width", (me.x.bandwidth()-5))
          .attr("y", function(d) { return me.y(d[me.yVar]); })
          .attr("height", function(d) { return height - me.y(d[me.yVar]); });

      },
      barClicked: function(bar) {
        this.$emit('barClicked', bar)
      },
      clearChart: function() {
        console.log("Removing")
        this.svg.selectAll('g').remove()
        this.svg.selectAll('rect').remove()
      }
    }
  }
</script>
<style>
  .bar {
    fill: black;
  }
  .bar:hover {
    cursor: pointer;
  }

  .active {
    fill: orange;
  }
  .axis-text {
    font-size: 10pt;
  }
</style>
