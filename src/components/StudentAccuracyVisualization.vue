
<template>
  <div>
    <svg width="1000" height="800"></svg>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "StudentAccuracyVisualization",
  mounted() {
    this.createChart();
  },
  methods: {
    createChart() {
      // Dimensions and margins
      const margin = {top: 20, right: 40, bottom: 40, left: 40};
      const width = 1500 - margin.left - margin.right;
      const height = 800 - margin.top - margin.bottom;

      // Create SVG
      const svg = d3.select('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Create scales
      const y = d3.scaleLinear()
        .domain([0, 1])
        .range([height, 0]);

      const r = d3.scaleSqrt()
        .domain([0, 1])
        .range([0, 40]);

      // Tooltip
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      // Load data
      d3.csv('student_accuracies.csv').then(data => {
        // Extract unique questions
        const questions = Array.from(new Set(data.map(d => d.title_ID)));

        const x = d3.scaleBand()
          .domain(questions)
          .range([0, width])
          .padding(0.05);  // Adjust this value to change spacing

        // Add vertical lines
        svg.selectAll('.line')
          .data(questions)
          .enter()
          .append('line')
          .attr('x1', d => x(d) + x.bandwidth() / 2)
          .attr('x2', d => x(d) + x.bandwidth() / 2)
          .attr('y1', 0)
          .attr('y2', height)
          .attr('stroke', 'grey')
          .attr('stroke-width', 2);

        // Add bubbles
        svg.selectAll('.bubble')
          .data(data)
          .enter()
          .append('circle')
          .attr('class', 'bubble')
          .attr('cx', d => x(d.title_ID) + x.bandwidth() / 2)
          .attr('cy', d => y(d.accuracy))
          .attr('r', d => r(d.accuracy)/2.5);

        // Uncomment the lines below to add labels
        // svg.selectAll('.label')
        //   .data(data)
        //   .enter()
        //   .append('text')
        //   .attr('class', 'label')
        //   .attr('x', d => x(d.title_ID) + x.bandwidth() / 2)
        //   .attr('y', d => y(d.accuracy))
        //   .attr('dy', -10)
        //   .attr('text-anchor', 'middle')
        //   .text(d => d.student_ID);
      }).catch(error => {
        console.error('Error loading or parsing data:', error);
      });
    }
  }
};
</script>

<style scoped>
.bubble {
  fill: #3C7DF3;
  opacity: 0.5;
}
.tooltip {
  position: absolute;
  text-align: center;
  width: 150px;
  height: auto;
  padding: 5px;
  font: 12px sans-serif;
  background: lightsteelblue;
  border: 1px solid #aaa;
  border-radius: 8px;
  pointer-events: none;
}
</style>
