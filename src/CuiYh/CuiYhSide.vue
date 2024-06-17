<template>
  <div class="chart-container">
    <div v-for="(dataset, index) in datasets" :key="index" :id="'chart' + (index + 1)" class="chart"></div>
    <div class="tooltip" id="tooltip"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'CuiYhSide',
  data() {
    return {
      datasets: [
        { file: "班级15.csv", name: "班15" },
        { file: "班级14.csv", name: "班14" },
        { file: "班级1.csv", name: "班13" },
        { file: "班级4.csv", name: "班12" },
        { file: "班级5.csv", name: "班11" },
        { file: "班级6.csv", name: "班10" },
        { file: "班级7.csv", name: "班9" },
        { file: "班级8.csv", name: "班8" },
        { file: "班级9.csv", name: "班7" },
        { file: "班级10.csv", name: "班6" },
        { file: "班级11.csv", name: "班5" },
        { file: "班级12.csv", name: "班4" },
        { file: "班级13.csv", name: "班3" }
      ],
      colorScheme: ["#87B1FD", "#A7C5FB", "#06D7A0", "#48DCC4", "#A5FBB9"]
    };
  },
  mounted() {
    this.datasets.forEach((dataset, index) => {
      d3.csv(process.env.BASE_URL + 'data/' + dataset.file).then(data => {
        this.processData(data, '#chart' + (index + 1), dataset.name);
      });
    });
  },
  methods: {
    processData(data, chartID, datasetName) {
      data.forEach(function(d) {
        d.score = +d.score;
      });

      const nestedData = Array.from(d3.group(data, d => d.student_ID), ([key, value]) => ({
        student_ID: key,
        major: value[0].major
      }));

      const groupedByMajor = Array.from(d3.group(nestedData, d => d.major), ([key, value]) => ({
        major: key,
        students: value
      }));

      // Create an array of 100 slots
      const fixedGrid = Array(100).fill(null);
      let index = 0;

      // Distribute students into the fixedGrid by major
      groupedByMajor.forEach(group => {
        group.students.forEach(student => {
          if (index < 100) {
            fixedGrid[index] = student;
            index++;
          }
        });
      });

      const margin = { top: 0, right: 0, bottom: 0, left: 0 },
            width = 150 - margin.left - margin.right,
            height = 150 - margin.top - margin.bottom,
            radius = Math.min(width, height) / 2;

      d3.select(chartID + ' svg').remove();

      const svg = d3.select(chartID).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${(width + margin.left + margin.right) / 2},${(height + margin.top + margin.bottom) / 2})`);

      const color = d3.scaleOrdinal()
        .domain(fixedGrid.map(d => d ? d.major : ''))
        .range(this.colorScheme);

      const arc = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius * 0.7)
        .padAngle(0.02)
        .padRadius(radius * 0.2);

      const pie = d3.pie()
        .sort(null)
        .value(() => 1);

      const g = svg.selectAll('.arc')
        .data(pie(fixedGrid))
        .enter().append('g')
        .attr('class', 'arc');

      g.append('path')
        .attr('d', arc)
        .attr('fill', d => d.data ? color(d.data.major) : 'none') // 设置为空格子的颜色为 'none'
        .attr('stroke', 'none')
        .append('title')
        .text(d => d.data ? `学生ID: ${d.data.student_ID}\n专业: ${d.data.major}` : '');

      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-size', '8px')
        .style('font-weight', 'bold')
        .style('fill', '#000')
        .text(datasetName);

      const innerRadius = radius * 0.23;
      const outerRadius = radius * 0.45;

      const knowledgeArc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

      const knowledgeScores = d3.rollups(data, v => d3.sum(v, d => d.score) / v.length, d => d.knowledge);

      const knowledgePie = d3.pie()
        .sort(null)
        .value(() => 1);

      const knowledgeG = svg.selectAll('.knowledge-arc')
        .data(knowledgePie(knowledgeScores))
        .enter().append('g')
        .attr('class', 'knowledge-arc');

      knowledgeG.append('path')
        .attr('d', knowledgeArc)
        .attr('fill', '#EDEDED');

      const scoreScale = d3.scaleLinear()
        .domain([0, d3.max(knowledgeScores, d => d[1])])
        .range([innerRadius, outerRadius]);

      const tooltip = d3.select('#tooltip');

      knowledgeG.append('circle')
        .attr('cx', (d, i) => scoreScale(d.data[1]) * Math.cos(2 * Math.PI * i / knowledgeScores.length - Math.PI / 2))
        .attr('cy', (d, i) => scoreScale(d.data[1]) * Math.sin(2 * Math.PI * i / knowledgeScores.length - Math.PI / 2))
        .attr('r', 3)
        .attr('fill', '#6BFF8D')
        .on('mouseover', function(event, d) {
          tooltip.transition()
            .duration(200)
            .style('opacity', .9);
          tooltip.html(`Knowledge: ${d.data[0]}<br/>Avg Score: ${d.data[1].toFixed(2)}`)
            .style('left', (event.pageX) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
          tooltip.transition()
            .duration(500)
            .style('opacity', 0);
        });
    }
  }
};
</script>

<style scoped>
.axis path,
.axis line {
  fill: none;
  shape-rendering: crispEdges;
}
.chart-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.chart {
  flex: 1 1 49%; 
}
.tooltip {
  position: absolute;
  text-align: left;
  width: auto;
  height: auto;
  padding: 8px;
  font: 12px sans-serif;
  background: #44AA95;
  border: 0px;
  border-radius: 8px;
  pointer-events: none;
  opacity: 0;
}
</style>
