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
      colorScheme: ["#87B1FD", "#A7C5FB", "#06D7A0", "#48DCC4", "#A5FBB9"],
      knowledgeOrder: []  // 用于存储统一的知识维度顺序
    };
  },
  mounted() {
    // 读取所有文件，确定知识维度的统一顺序
    Promise.all(this.datasets.map(dataset => d3.csv(process.env.BASE_URL + 'data/' + dataset.file))).then(files => {
      const allData = files.flat();
      const allKnowledge = Array.from(new Set(allData.map(d => d.knowledge)));
      this.knowledgeOrder = allKnowledge.sort(); // 可以根据需要调整排序方法

      // 处理每个文件的数据
      this.datasets.forEach((dataset, index) => {
        d3.csv(process.env.BASE_URL + 'data/' + dataset.file).then(data => {
          this.processData(data, '#chart' + (index + 1), dataset.name);
        });
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

      // 按专业对学生进行分组
      const groupedByMajor = Array.from(d3.group(nestedData, d => d.major), ([key, value]) => ({
        major: key,
        students: value
      }));

      // 创建一个长度为 100 的数组
      const fixedGrid = Array(100).fill(null);
      let index = 0;

      // 按专业分配学生到该数组中
      groupedByMajor.forEach(group => {
        group.students.forEach(student => {
          if (index < 100) {
            fixedGrid[index] = student;
            index++;
          }
        });
      });

      const margin = { top: 0, right: 0, bottom: 0, left: 0 },
            width = 120 - margin.left - margin.right,
            height = 120 - margin.top - margin.bottom,
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
        .innerRadius(radius * 0.2)
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
<<<<<<< Updated upstream
        .style('font-size', '7px')
=======
        .style('font-size', '6px')
>>>>>>> Stashed changes
        .style('font-weight', 'bold')
        .style('fill', '#000')
        .text(datasetName);

      const innerRadius = radius * 0.23;
      const outerRadius = radius * 0.45;

      const knowledgeArc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

      // 找出每个 knowledge 维度内所有题目可能的最高分
      const maxScores = d3.rollup(data, v => d3.max(v, d => d.score), d => d.knowledge);

      // 计算每个记录的正确率
      data.forEach(d => {
        d.correct_rate = d.score / maxScores.get(d.knowledge);
      });

      // 计算知识分数（正确率），按照统一的顺序排序
      const knowledgeScores = this.knowledgeOrder.map(k => {
        const scores = data.filter(d => d.knowledge === k).map(d => d.correct_rate);
        return [k, d3.mean(scores)];
      });

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

      // 绘制知识分数圆形
      knowledgeG.append('circle')
        .attr('cx', (d, i) => scoreScale(d.data[1]) * Math.cos(2 * Math.PI * i / knowledgeScores.length - Math.PI / 2))
        .attr('cy', (d, i) => scoreScale(d.data[1]) * Math.sin(2 * Math.PI * i / knowledgeScores.length - Math.PI / 2))
<<<<<<< Updated upstream
        .attr('r', 2.6)
=======
        .attr('r', 2.2)
>>>>>>> Stashed changes
        .attr('fill', '#6BFF8D')
        .on('mouseover', function(event, d) {
          tooltip.transition()
            .duration(200)
            .style('opacity', .9);
          tooltip.html(`Knowledge: ${d.data[0]}<br/>Correct Rate: ${(d.data[1] * 100).toFixed(2)}%`)
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
  box-sizing: border-box;
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
