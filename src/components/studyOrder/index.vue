<template>
  <div>
    <div class="container" id="container"></div>
    <div class="tooltip" id="tooltip"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'StudentLearningPathsChordDiagrams',
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      d3.json('111student_knowledge_analysis.json')
        .then((data) => {
          const container = d3.select('#container');
          const tooltip = d3.select('#tooltip');

          const knowledgeSequence = [
            'r8S3g',
            't5V9e',
            'm3D1v',
            'k4W1c',
            'y9W5d',
            's8Y2f',
            'g7R2j',
            'b3C9s',
          ];

          Object.keys(data).forEach((studentId) => {
            const studentData = data[studentId];
            const sequence = Array.from(
              new Set(studentData.map((d) => d.knowledge))
            );

            const svgContainer = container
              .append('div')
              .attr('class', 'svg-container');

            // Add student ID as a title above each SVG
            svgContainer
              .append('text')
              .attr('x', 0)
              .attr('y', 20)
              .style('font-size', '14px')
              .text(`Student ID: ${studentId}`);

            const svg = svgContainer
              .append('svg')
              .attr('width', 1400)
              .attr('height', 200);

            const margin = { top: 40, right: 20, bottom: 20, left: 20 }; // Increase top margin for the title
            svg.attr('width') - margin.left - margin.right;
            svg.attr('height') - margin.top - margin.bottom;
            const g = svg
              .append('g')
              .attr('transform', `translate(${margin.left},${margin.top})`);

            // Manually set node positions
            const nodePositions = {
              r8S3g: { x: 20, y: 60 },
              t5V9e: { x: 120, y: 60 },
              m3D1v: { x: 220, y: 60 },
              k4W1c: { x: 320, y: 60 },
              y9W5d: { x: 420, y: 60 },
              s8Y2f: { x: 520, y: 60 },
              g7R2j: { x: 620, y: 60 },
              b3C9s: { x: 720, y: 60 },
            };
            const nodes = sequence.map((knowledge) => ({
              id: knowledge,
              x: nodePositions[knowledge].x,
              y: nodePositions[knowledge].y,
            }));

            const links = studentData
              .map((d) => {
                const sourceNode = nodes.find((n) => n.id === d.knowledge);
                const nextIndex = studentData.findIndex(
                  (s) => s.knowledge_start_time === d.knowledge_end_time
                );
                const targetNode =
                  nextIndex !== -1
                    ? nodes.find(
                        (n) => n.id === studentData[nextIndex].knowledge
                      )
                    : null;
                if (
                  !sourceNode ||
                  !targetNode ||
                  sourceNode.id === targetNode.id
                )
                  return null;
                return {
                  source: sourceNode,
                  target: targetNode,
                  count: d.submission_count,
                  correct_count: d.correct_submission_count,
                  start_time: new Date(d.knowledge_start_time),
                };
              })
              .filter((d) => d);

            const colorScale = d3
              .scaleSequential(d3.interpolateViridis)
              .domain([
                d3.min(links, (d) => d.start_time),
                d3.max(links, (d) => d.start_time),
              ])
              .range(['#B1C9F4', '#355eaa']);

            g.selectAll('.link')
              .data(links)
              .enter()
              .append('path')
              .attr('class', 'link')
              .attr('d', (d) => {
                const dx = d.target.x - d.source.x;
                const isForward =
                  knowledgeSequence.indexOf(d.source.id) <
                  knowledgeSequence.indexOf(d.target.id);
                const dy = isForward ? -150 : 150;
                return `M${d.source.x},${d.source.y} Q${d.source.x + dx / 2},${
                  d.source.y + dy
                } ${d.target.x},${d.target.y}`;
              })
              .attr('stroke', (d) => colorScale(d.start_time))
              .attr('stroke-width', (d) => d.count / 3)
              .attr('fill', 'none')
              .on('mouseover', (event, d) => {
                tooltip.transition().duration(200).style('opacity', 0.9);
                tooltip
                  .html(
                    `
                <strong>学习顺序:</strong> ${d.source.id} → ${d.target.id}<br>
                <strong>提交次数:</strong> ${d.count}<br>
                <strong>正确提交次数:</strong> ${d.correct_count}<br>
                <strong>开始时间:</strong> ${d.start_time.toLocaleString()}
              `
                  )
                  .style('left', event.pageX + 5 + 'pxnpm')
                  .style('top', event.pageY - 28 + 'px');
              })
              .on('mouseout', () => {
                tooltip.transition().duration(500).style('opacity', 0);
              });

            // Draw correct submission links
            g.selectAll('.correct-link')
              .data(links)
              .enter()
              .append('path')
              .attr('class', 'correct-link')
              .attr('d', (d) => {
                const dx = d.target.x - d.source.x;
                const isForward =
                  knowledgeSequence.indexOf(d.source.id) <
                  knowledgeSequence.indexOf(d.target.id);
                const dy = isForward ? -170 : 170; // Draw outside the main submission links
                return `M${d.source.x},${d.source.y} Q${d.source.x + dx / 2},${
                  d.source.y + dy
                } ${d.target.x},${d.target.y}`;
              })
              .attr('stroke', '#7CE9B5')
              .attr('stroke-width', (d) => d.correct_count / 3)
              .attr('fill', 'none')
              .on('mouseover', (event, d) => {
                tooltip.transition().duration(200).style('opacity', 0.9);
                tooltip
                  .html(
                    `
                <strong>Source:</strong> ${d.source.id}<br>
                <strong>Target:</strong> ${d.target.id}<br>
                <strong>Correct Submissions:</strong> ${d.correct_count}<br>
                <strong>Start Time:</strong> ${d.start_time.toLocaleString()}
              `
                  )
                  .style('left', event.pageX + 5 + 'px')
                  .style('top', event.pageY - 28 + 'px');
              })
              .on('mouseout', () => {
                tooltip.transition().duration(500).style('opacity', 0);
              });

            g.selectAll('.node')
              .data(nodes)
              .enter()
              .append('circle')
              .attr('class', 'node')
              .attr('r', 10) // Adjust the node radius if needed
              .attr('cx', (d) => d.x)
              .attr('cy', (d) => d.y);

            g.selectAll('.label')
              .data(nodes)
              .enter()
              .append('text')
              .attr('class', 'label')
              .attr('x', (d) => d.x)
              .attr('y', (d) => d.y + 25)
              .attr('text-anchor', 'middle')
              .text((d) => d.id);
          });
        })
        .catch((error) => {
          console.error('Error loading the JSON file:', error);
        });
    },
  },
};
</script>

<style scoped>
.node {
  fill: #355eaa;
  stroke-width: 1.5px;
}
.link {
  fill: none;
  stroke-opacity: 0.6;
}
.correct-link {
  fill: none;
  stroke-opacity: 0.8;
}
.horizontal-link {
  stroke: grey;
  stroke-width: 5;
  fill: none;
}
.container {
  overflow-y: auto;
  height: 500px;
  width: 100%;
}
.svg-container {
  margin-bottom: 10px;
}
.tooltip {
  position: absolute;
  padding: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  pointer-events: none;
  opacity: 0;
}
</style>
