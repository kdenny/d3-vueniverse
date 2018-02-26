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
    var el = d3.select(this.$el).select("#svg");
    console.log(this.chartData)

//    this.height = +el.attr('height');
//    this.width = +el.attr('width');

    this.chartWidth = this.width - this.margin.left - this.margin.right;
    this.chartHeight = this.height - this.margin.top - this.margin.bottom;

    var data = [
      {"date":"4/1854","total":155,"seen":73,"used":5,"unknown":77}
      ];
    var stackKey = ["unknown", "seen", "used"];
    var parseDate = d3.timeParse("%m/%Y"),
    xScale = d3.scaleLinear().rangeRound([0, this.chartWidth]),
    yScale = d3.scaleBand().rangeRound([this.chartHeight, 0]).padding(0.1),
    color = ['#D06B77',
      '#EEEF63',
      '#7FEB96'],
    xAxis = d3.axisBottom(xScale),
    yAxis =  d3.axisLeft(yScale).tickFormat(d3.timeFormat("%b"))
    this.svg = el
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("viewBox", " 0 0 " + this.width + " " + this.height)
      .attr("preserveAspectRatio", "xMidYMid")
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    var stack = d3.stack()
      .keys(stackKey)
      /*.order(d3.stackOrder)*/
      .offset(d3.stackOffsetNone);

    var layers= stack(data);
    data.sort(function(a, b) { return b.total - a.total; });
    yScale.domain(data.map(function(d) { return parseDate(d.date); }));
//    xScale.domain([0, d3.max(layers[layers.length - 1], function(d) { return d[0] + d[1]; }) ]).nice();
    xScale.domain([0, 155]);

    var layer = this.svg.selectAll(".layer")
      .data(layers)
      .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) { return color[i]; });

    layer.selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
      .attr("y", function(d) { return yScale(parseDate(d.data.date)); })
      .attr("x", function(d) { return xScale(d[0]); })
      .attr("height", yScale.bandwidth())
      .attr("width", function(d) { return xScale(d[1]) - xScale(d[0]) });

    svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + (this.chartHeight+5) + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(0,0)")
      .call(yAxis);

    // console.log(this.chartData)
    // console.log(this.xVar)

//    this.drawChart(this.chartData);

  },
//  watch: {
//    chartData(newTree) {
//      console.log(newTree)
//      console.log(this.chartData)
//      this.clearChart()
////      this.etl()
////      this.renderChart()
//      this.drawChart(this.chartData)
//    }
//  },
  props: ['width', 'height', 'margin', 'apiLoc', 'xVar', 'xScale', 'yVar', 'selectedBar'],
  data() {
    return {
      data: [{ethnicity: 'alien', seen: 52, used: 108, not_seen: 250}, {ethnicity: 'scuba', seen: 52, used: 108, not_seen: 250}]
    }
  },
  methods: {
    drawChart: function(data) {

      var me = this;

      me.y.domain([0, d3.max(me.chartData, function(d) { return d[me.yVar]; })]);
//      me.x.domain(['1 mo', '2 mo', '3-6 mo', '6-12 mo', '1 yr', '2 yr', '> 3 yr'])
      me.x.domain(me.xScale)

//      me.x.domain(me.chartData.map(function(d) { return d[me.xVar]; }));


      me.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + me.chartHeight + ")")
        .call(me.xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)" );

      me.svg.append("g")
        .attr("class", "y axis")
        .call(me.yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
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
          console.log(d3.select(this))
//          d3.select(this).attr("class", "active")
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
        .attr("height", function(d) { return me.chartHeight - me.y(d[me.yVar]); });

    },
    barClicked: function(bar) {
      this.$emit('barClicked', bar)
    },
    clearChart: function() {
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
</style>
