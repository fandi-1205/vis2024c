<template>
  <div id="chart"></div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'CumulativeAverageScoreChart',
  data() {
    return {
      chartData: [],
    };
  },
  mounted() {
    this.drawChart();
  },
  methods: {
    drawChart() {
      d3.json('cumulative_average_scores.json').then((data) => {
        this.chartData = data;
        // console.log(this.chartData);
        // const lineChartData = this.chartData;
      });
    },

    // drawChart() {
    //   const width = 960;
    //   const height = 500;
    //   const margin = { top: 20, right: 30, bottom: 50, left: 60 };

    //   const svg = d3
    //     .select('#chart')
    //     .append('svg')
    //     .attr('width', width)
    //     .attr('height', height)
    //     .append('g')
    //     .attr('transform', `translate(${margin.left},${margin.top})`);

    //   d3.json('cumulative_average_scores.json')
    //     .then((data) => {
    //       this.chartData = data;
    //       const x = d3
    //         .scaleLinear()
    //         .domain([
    //           1,
    //           d3.max(Object.values(this.chartData), (d) =>
    //             d3.max(d, (v) => v.submission)
    //           ),
    //         ])
    //         .range([0, width - margin.left - margin.right]);

    //       const y = d3
    //         .scaleLinear()
    //         .domain([0, 1])
    //         .range([height - margin.top - margin.bottom, 0]);

    //       const line = d3
    //         .line()
    //         .x((d) => x(d.submission))
    //         .y((d) => y(d.cumulative_average_score));

    //       svg
    //         .append('g')
    //         .attr(
    //           'transform',
    //           `translate(0,${height - margin.top - margin.bottom})`
    //         )
    //         .call(d3.axisBottom(x));

    //       svg.append('g').call(d3.axisLeft(y));

    //       const color = d3.scaleOrdinal(d3.schemeCategory10);

    //       for (const [knowledge, values] of Object.entries(this.chartData)) {
    //         svg
    //           .append('path')
    //           .datum(values)
    //           .attr('fill', 'none')
    //           .attr('stroke', color(knowledge))
    //           .attr('class', 'line')
    //           .attr('d', line);

    //         svg
    //           .append('text')
    //           .datum(values[values.length - 1])
    //           .attr(
    //             'transform',
    //             (d) =>
    //               `translate(${x(d.submission)},${y(
    //                 d.cumulative_average_score
    //               )})`
    //           )
    //           .attr('x', 5)
    //           .attr('dy', '.35em')
    //           .style('fill', color(knowledge))
    //           .text(knowledge);
    //       }

    //       svg
    //         .append('text')
    //         .attr('x', (width - margin.left - margin.right) / 2)
    //         .attr('y', height - margin.bottom)
    //         .attr('class', 'axis-label')
    //         .style('text-anchor', 'middle')
    //         .text('Submission Times');

    //       svg
    //         .append('text')
    //         .attr('transform', 'rotate(-90)')
    //         .attr('y', 0 - margin.left)
    //         .attr('x', 0 - (height - margin.top - margin.bottom) / 2)
    //         .attr('dy', '1em')
    //         .attr('class', 'axis-label')
    //         .style('text-anchor', 'middle')
    //         .text('Cumulative Average Score');
    //     })
    //     .catch((error) => {
    //       console.error('Error loading or parsing data:', error);
    //     });
    // },
  },
};
</script>

<style scoped>
.line {
  fill: none;
  stroke-width: 2px;
}
.axis-label {
  font-size: 12px;
}
</style>
