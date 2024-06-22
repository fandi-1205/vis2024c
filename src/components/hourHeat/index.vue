<template>
  <div id="heatmap-container"></div>
</template>

<script>
import * as d3 from 'd3';
import axios from 'axios';

export default {
  name: 'HourlySubmissionsHeatmap',
  data() {
    return {
      data: [],
    };
  },
  mounted() {
    const margin = { top: 20, right: 0, bottom: 30, left: 50 },
      fixedWidth = 960,
      fixedHeight = 90,
      width = fixedWidth - margin.left - margin.right,
      // height = fixedHeight - margin.top - margin.bottom,
      gridSize = Math.floor(width / 24),
      colors = [
        '#D9FFE4',
        '#B6EDD4',
        '#94DBC4',
        '#71C9B4',
        '#41B6C4',
        '#538ADE',
        '#4778C8',
        '#3E6AB7',
        '#3359A2',
      ];
    // colors = [
    //   '#97C1FF',
    //   '#A1C3FE',
    //   '#ADC5FD',
    //   '#BAC8FD',
    //   '#C8CBFC',
    //   '#D5CDFB',
    //   '#E0CFFA',
    //   '#EED2F9',
    //   '#FCD5F8',
    // ];

    axios
      .get('http://127.0.0.1:3001/time')
      .then((response) => {
        this.data = response.data;
        console.log(this.data);
        const container = d3.select(this.$el); // Select the outer container

        this.data.forEach((student) => {
          // Create a container for each student
          const studentContainer = container
            .append('div')
            .attr('class', 'student-container');

          studentContainer
            .append('div')
            .attr('class', 'student-title')
            .style('font-weight', 'bold')
            .text(`Student ID: ${student._id}`);

          const svg = studentContainer
            .append('svg')
            .attr('width', fixedWidth)
            .attr('height', fixedHeight)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

          // Prepare data for the heatmap
          const hoursData = Array.from({ length: 24 }, (_, hour) => {
            const hourData = student.hoursData.find((d) => d.hour === hour);
            const count = hourData
              ? d3.sum(hourData.questionCounts, (d) => d.count)
              : 0;
            return { hour, count };
          });

          // Create color scale
          const colorScale = d3
            .scaleQuantile()
            .domain([0, d3.max(hoursData, (d) => d.count)])
            .range(colors);

          // Create heatmap squares
          const heatMap = svg
            .selectAll('.hour')
            .data(hoursData)
            .enter()
            .append('rect')
            .attr('x', (d) => d.hour * gridSize)
            .attr('y', 0) // Place the squares at the top
            .attr('class', 'hour bordered')
            .attr('width', gridSize)
            .attr('height', gridSize)
            .style('fill', (d) =>
              d.count === 0 ? '#ffffff' : colorScale(d.count)
            )
            .style('stroke', '#3359A2')
            .style('stroke-width', 1);

          heatMap.append('title').text((d) => d.count);

          // Create hour labels below the squares
          svg
            .selectAll('.hourLabel')
            .data(d3.range(24))
            .enter()
            .append('text')
            .text((d) => d)
            .attr('x', (d, i) => i * gridSize)
            .attr('y', gridSize + 25) // Place the labels below the squares
            .style('text-anchor', 'middle')
            .attr('transform', `translate(${gridSize / 2}, 0)`)
            .attr('class', 'hourLabel');
        });
      })
      .catch((error) => {
        console.log(error);
      });

    // d3.json('time.json')
    //   .then((data) => {
    //     const container = d3.select(this.$el); // Select the outer container

    //     data.forEach((student) => {
    //       // Create a container for each student
    //       const studentContainer = container
    //         .append('div')
    //         .attr('class', 'student-container');

    //       studentContainer
    //         .append('div')
    //         .attr('class', 'student-title')
    //         .text(`Student ID: ${student._id}`);

    //       const svg = studentContainer
    //         .append('svg')
    //         .attr('width', fixedWidth)
    //         .attr('height', fixedHeight)
    //         .append('g')
    //         .attr('transform', `translate(${margin.left},${margin.top})`);

    //       // Prepare data for the heatmap
    //       const hoursData = Array.from({ length: 24 }, (_, hour) => {
    //         const hourData = student.hoursData.find((d) => d.hour === hour);
    //         const count = hourData
    //           ? d3.sum(hourData.questionCounts, (d) => d.count)
    //           : 0;
    //         return { hour, count };
    //       });

    //       // Create color scale
    //       const colorScale = d3
    //         .scaleQuantile()
    //         .domain([0, d3.max(hoursData, (d) => d.count)])
    //         .range(colors);

    //       // Create heatmap squares
    //       const heatMap = svg
    //         .selectAll('.hour')
    //         .data(hoursData)
    //         .enter()
    //         .append('rect')
    //         .attr('x', (d) => d.hour * gridSize)
    //         .attr('y', 0) // Place the squares at the top
    //         .attr('class', 'hour bordered')
    //         .attr('width', gridSize)
    //         .attr('height', gridSize)
    //         .style('fill', (d) =>
    //           d.count === 0 ? '#ffffff' : colorScale(d.count)
    //         )
    //         .style('stroke', '#000')
    //         .style('stroke-width', 1);

    //       heatMap.append('title').text((d) => d.count);

    //       // Create hour labels below the squares
    //       svg
    //         .selectAll('.hourLabel')
    //         .data(d3.range(24))
    //         .enter()
    //         .append('text')
    //         .text((d) => d)
    //         .attr('x', (d, i) => i * gridSize)
    //         .attr('y', gridSize + 25) // Place the labels below the squares
    //         .style('text-anchor', 'middle')
    //         .attr('transform', `translate(${gridSize / 2}, 0)`)
    //         .attr('class', 'hourLabel');
    //     });
    //   })
    //   .catch((error) => console.error('Error loading the JSON data:', error));
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
.student-container {
  margin-bottom: 15px;
}
.student-title {
  font-size: 14px;
  /* font-weight: bold; */
}
#heatmap-container {
  width: 1020px; /* Set the desired container width */
  height: 360px; /* Set the desired container height */
  overflow-y: scroll; /* Enable vertical scrolling if needed */
  border: 1px solid #ccc; /* Add a border for visual reference */
  padding: 20px 80px;
}
.hourLabel {
  font-size: 15px;
  /* font-weight: bold; */
}
</style>
