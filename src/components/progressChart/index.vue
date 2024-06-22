<template>
  <div id="chart"></div>
</template>

<script>
import * as d3 from 'd3';
// import data from 'cumulative_average_scores.json';

export default {
  name: 'CumulativeAverageScoreChart',
  data() {
    return {
      progressData: [],
    };
  },
  mounted() {
    this.drawChart();
  },
  methods: {
    async drawChart() {
      try {
        const response = await d3.json('cumulative_average_scores.json');
        this.progressData = response;
        // 在这里安全地使用 this.progressData，因为它已经被赋值了
        // console.log(this.progressData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
      const width = 700;
      const height = 340;
      const margin = { top: 20, right: 30, bottom: 50, left: 60 };

      const svg = d3
        .select('#chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const x = d3
        .scaleLinear()
        .domain([
          1,
          d3.max(this.progressData, (d) =>
            d3.max(d.values, (v) => v.submission)
          ),
        ])
        .range([0, width - margin.left - margin.right]);

      const y = d3
        .scaleLinear()
        .domain([0, 1])
        .range([height - margin.top - margin.bottom, 0]);

      const line = d3
        .line()
        .x((d) => x(d.submission))
        .y((d) => y(d.cumulative_average_score));

      svg
        .append('g')
        .attr(
          'transform',
          `translate(0,${height - margin.top - margin.bottom})`
        )
        .call(d3.axisBottom(x));

      svg.append('g').call(d3.axisLeft(y));

      // const color = d3.scaleOrdinal(d3.schemeCategory10);
      const colors = [
        '#425A9D',
        '#5C83DF',
        '#9EBFFF',
        '#6FB4C2',
        '#A9D9C5',
        '#8BF2DA',
        '#FFA6D1',
        '#FCD5F8',
      ];
      let knowledgeListOld = [];
      this.progressData.forEach((d) => {
        knowledgeListOld.push(d.knowledge);
      });
      // const knowledgeListNew = new Set(...knowledgeListOld);
      // console.log(knowledgeListOld);

      this.progressData.forEach((d, i) => {
        svg
          .append('path')
          .datum(d.values)
          .attr('fill', 'none')
          .attr('stroke', colors[i])
          .attr('class', 'line')
          .attr('d', line)
          .attr('stroke-width', 3);

        svg
          .append('text')
          .datum(d.values[d.values.length - 1])
          .attr(
            'transform',
            (d) =>
              `translate(${x(d.submission)},${y(d.cumulative_average_score)})`
          )
          .attr('x', 5)
          .attr('dy', '.35em')
          .style('font-size', '20px')
          .style('fill', colors[i])
          .text(d.knowledge);
      });

      svg
        .append('text')
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('y', height - margin.bottom)
        .attr('class', 'axis-label')
        .style('text-anchor', 'middle')
        .text('Submission Times');

      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height - margin.top - margin.bottom) / 2)
        .attr('dy', '1em')
        .attr('class', 'axis-label')
        .style('text-anchor', 'middle')
        .text('Cumulative Average Score');
    },
  },
};
</script>

<style scoped></style>
