<template>
  <div>
    <svg width="960" height="400"></svg>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'StudentScores',
  mounted() {
    d3.csv('student_average_scores_updated.csv').then((data) => {
      data.forEach((d) => {
        d.knowledge_avg_score = +d.knowledge_avg_score;
        d.question_avg_score = +d.question_avg_score;
        d.knowledge_t5v9e_count = +d.knowledge_t5v9e_count;
        d.question_3MwAFlmNO8EKrpY5zjUd_count =
          +d.question_3MwAFlmNO8EKrpY5zjUd_count;
      });

      data.sort((a, b) => b.knowledge_avg_score - a.knowledge_avg_score);

      data.forEach((d, i) => {
        d.rank = i + 1;
      });

      const margin = { top: 20, right: 20, bottom: 100, left: 40 },
        width = 960 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

      const x = d3
        .scaleBand()
        .domain(data.map((d) => d.rank))
        .range([0, width])
        .padding(0.1);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.question_avg_score)])
        .nice()
        .range([height, 0]);

      const svg = d3
        .select(this.$el)
        .select('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const tooltip = d3
        .select(this.$el)
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

      svg
        .append('g')
        .selectAll('.line')
        .data(data)
        .enter()
        .append('line')
        .attr('class', 'line')
        .attr('x1', (d) => x(d.rank) + x.bandwidth() / 2)
        .attr('y1', y(0))
        .attr('x2', (d) => x(d.rank) + x.bandwidth() / 2)
        .attr('y2', (d) => y(d.question_avg_score));

      svg
        .append('g')
        .selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('r', 6)
        .attr('cx', (d) => x(d.rank) + x.bandwidth() / 2)
        .attr('cy', y(0))
        .transition()
        .duration(1000)
        .attr('cy', (d) => y(d.question_avg_score));

      svg
        .append('g')
        .selectAll('.dot-inner')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot-inner')
        .attr('r', (d) => Math.sqrt(d.question_3MwAFlmNO8EKrpY5zjUd_count))
        .attr('cx', (d) => x(d.rank) + x.bandwidth() / 2)
        .attr('cy', (d) => y(d.question_avg_score))
        .on('mouseover', function (event, d) {
          tooltip.transition().duration(200).style('opacity', 0.9);
          tooltip
            .html(
              `ID: ${d.student_ID}<br>Knowledge Avg Score: ${d.knowledge_avg_score}<br>Question Avg Score: ${d.question_avg_score}<br>Knowledge Count: ${d.knowledge_t5v9e_count}<br>Question Count: ${d.question_3MwAFlmNO8EKrpY5zjUd_count}`
            )
            .style('left', event.pageX + 5 + 'px')
            .style('top', event.pageY - 28 + 'px');
        })
        .on('mouseout', function () {
          tooltip.transition().duration(500).style('opacity', 0);
        });

      svg
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'end')
        .style("font-size", "8px")
        .attr('dx', '2px')
        .attr('dy', '6px');

      svg.append('g').attr('class', 'y axis').call(d3.axisLeft(y));
    });
  },
};
</script>

<style>
.chart {
  font: 10px sans-serif;
}
.axis path,
.axis line {
  fill: none;
  shape-rendering: crispEdges;
}
.dot {
  fill: #81a3e3;
}
.dot-inner {
  fill: #76f0b5;
}
.line {
  stroke: rgb(210, 210, 210);
  stroke-width: 0.9px;
}
.tooltip {
  position: absolute;
  text-align: left;
  width: auto;
  height: auto;
  padding: 8px;
  font: 12px sans-serif;
  background: lightsteelblue;
  border: 1px solid #333;
  border-radius: 4px;
  pointer-events: none;
}
</style>
