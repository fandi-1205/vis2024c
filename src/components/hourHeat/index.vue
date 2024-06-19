<template>
  <div>
    <h2>Hourly Submissions Heatmap</h2>
    <div id="heatmap"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'HourlyHeatmap',
  mounted() {
    this.drawHeatmap();
  },
  methods: {
    drawHeatmap() {
      // Set dimensions and margins
      const margin = { top: 20, right: 0, bottom: 30, left: 50 },
        width = 1000 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom,
        gridSize = Math.floor(width / 24),
        colors = [
          '#ffffd9',
          '#edf8b1',
          '#c7e9b4',
          '#7fcdbb',
          '#41b6c4',
          '#1d91c0',
          '#225ea8',
          '#253494',
          '#081d58',
        ];

      // Create the SVG container
      const svg = d3
        .select('#heatmap')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Load the data
      d3.csv('./hourly_submissions.csv').then((data) => {
        data.forEach((d) => {
          d.hour = +d.hour;
          d.count = +d.count;
        });

        // Ensure all hours are represented
        const hoursData = Array.from({ length: 24 }, (_, hour) => {
          const found = data.find((d) => d.hour === hour);
          return found ? found : { hour: hour, count: 0 };
        });

        // Create color scale
        const colorScale = d3
          .scaleQuantile()
          .domain([0, d3.max(hoursData, (d) => d.count)])
          .range(colors);

        // Create hour labels
        svg
          .selectAll('.hourLabel')
          .data(d3.range(24))
          .enter()
          .append('text')
          .text((d) => d)
          .attr('x', (d, i) => i * gridSize)
          .attr('y', 0)
          .style('text-anchor', 'middle')
          .attr('transform', `translate(${gridSize / 2}, -6)`)
          .attr('class', 'hourLabel');

        // Create heatmap squares
        const heatMap = svg
          .selectAll('.hour')
          .data(hoursData)
          .enter()
          .append('rect')
          .attr('x', (d) => d.hour * gridSize)
          .attr('y', gridSize)
          .attr('class', 'hour bordered')
          .attr('width', gridSize)
          .attr('height', gridSize)
          .style('fill', (d) =>
            d.count === 0 ? '#ffffff' : colorScale(d.count)
          )
          .style('stroke', '#000')
          .style('stroke-width', 1);

        heatMap.append('title').text((d) => d.count);
      });
    },
  },
};
</script>

<style scoped>
.heatmap {
  font: 10px sans-serif;
}
.axis path,
.axis line {
  fill: none;
  shape-rendering: crispEdges;
}
.hour {
  stroke: #000;
}
.day {
  fill: none;
  stroke: #ccc;
}
</style>
