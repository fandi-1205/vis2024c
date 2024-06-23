<template>
  <div id="chart"></div>
</template>

<script>
import * as d3 from 'd3';
// import data from 'cumulative_average_scores.json';

export default {
  name: 'CumulativeAverageScoreChart',
  props: {
    dataFilePath: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      progressData: [],
      studentId: '',
    };
  },

  mounted() {
    this.drawChart();
  },
  methods: {
    async drawChart() {
      try {
        const response = await d3.json(this.dataFilePath);
        this.progressData = response;
        //对路径进行处理
        const parts = this.dataFilePath.split('_');
        const desiredPart = parts[parts.length - 1].split('.')[0]; // 分割后取最后一部分，再去除.json后缀
        this.studentId = desiredPart;
      } catch (error) {
        console.error('Error loading data:', error);
      }
      const width = 520;
      const height = 340;
      const margin = { top: 20, right: 30, bottom: 50, left: 45 };

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
        .range([0, width - margin.left - margin.right - 50]);

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
        .call(d3.axisBottom(x).tickSize(0).tickPadding(10));

      svg.append('g').call(d3.axisLeft(y).tickSize(0).tickPadding(10));

      // const color = d3.scaleOrdinal(d3.schemeCategory10);
      const colors = [
        { name: 'r8S3g', color: '#425A9D' },
        { name: 't5V9e', color: '#5C83DF' },
        { name: 'm3D1v', color: '#9EBFFF' },
        { name: 'y9W5d', color: '#6FB4C2' },
        { name: 'k4W1c', color: '#A9D9C5' },
        { name: 's8Y2f', color: '#8BF2DA' },
        { name: 'g7R2j', color: '#FFA6D1' },
        { name: 'b3C9s', color: '#FCD5F8' },
      ];
      const uniqueColors = {};
      colors.forEach(({ name, color }) => {
        if (!uniqueColors[name]) {
          uniqueColors[name] = color;
        }
      });

      // 创建知识点到颜色的映射
      const knowledgeColorMap = Object.entries(uniqueColors).reduce(
        (acc, [name, color]) => {
          acc[name] = color;
          return acc;
        },
        {}
      );
      let knowledgeListOld = [];
      this.progressData.forEach((d) => {
        knowledgeListOld.push(d.knowledge);
      });
      // const knowledgeListNew = new Set(...knowledgeListOld);
      // console.log(knowledgeListOld);

      this.progressData.forEach((d) => {
        const path = svg
          .append('path')
          .datum(d.values)
          .attr('fill', 'none')
          .attr('class', 'line')
          .attr('d', line)
          .attr('stroke-width', 3);

        // 从映射表中获取颜色
        const colorForKnowledge = knowledgeColorMap[d.knowledge] || 'red'; // 如果没有找到对应颜色，默认为红色
        path.style('stroke', colorForKnowledge);

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
          .style('fill', knowledgeColorMap[d.knowledge])
          .text(d.knowledge);
      });

      svg
        .append('text')
        .attr('x', 100)
        .attr('y', height - margin.bottom + 20)
        .attr('class', 'axis-label')
        .style('font-size', '15px') // 设置文本大小为 16 像素
        .style('font-weight', 'bold') // 将文本设为加粗
        .style('text-anchor', 'middle')
        .text('Studen ID:' + this.studentId);
    },
  },
};
</script>

<style scoped></style>
