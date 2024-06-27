<template>
  <div class="top-main">
    <div class="map-title">学习流程图</div>
    <div class="pic"><img src="pic2.jpg" alt="img" /></div>
    <div class="container">
      <div class="column" id="column"></div>
      <!-- <div class="column" id="right-column"></div> -->
      <div class="tooltip" id="tooltip"></div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'ChordDiagram',
  mounted() {
    //111student_knowledge_analysis
    d3.json('replace-order.json')
      // d3.json('111student_knowledge_analysis.json')
      .then((data) => {
        const leftColumn = d3.select('#column');
        // const rightColumn = d3.select('#right-column');
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

          // const column = index % 2 === 0 ? leftColumn : rightColumn;
          const column = leftColumn;

          const svgContainer = column
            .append('div')
            .attr('class', 'svg-container');

          svgContainer
            .append('div')
            .attr('x', 0)
            .attr('y', 20)
            .style('font-size', '15px')
            .style('font-weight', 'bold')
            .text(`Student ID: ${studentId}`);

          const svg = svgContainer
            .append('svg')
            .attr('width', 700)
            .attr('height', 200);

          const margin = { top: 40, right: 50, bottom: 20, left: 20 };

          svg.attr('width') - margin.left - margin.right;
          svg.attr('height') - margin.top - margin.bottom;
          const g = svg
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

          const nodePositions = {
            r8S3g: { x: 10, y: 60 },
            t5V9e: { x: 100, y: 60 },
            m3D1v: { x: 190, y: 60 },
            k4W1c: { x: 280, y: 60 },
            y9W5d: { x: 370, y: 60 },
            s8Y2f: { x: 460, y: 60 },
            g7R2j: { x: 550, y: 60 },
            b3C9s: { x: 640, y: 60 },
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
                  ? nodes.find((n) => n.id === studentData[nextIndex].knowledge)
                  : null;
              if (!sourceNode || !targetNode || sourceNode.id === targetNode.id)
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
              if (
                (d.source.id === 'y9W5d' && d.target.id === 'k4W1c') ||
                (d.source.id === 'y9W5d' && d.target.id === 's8Y2f') ||
                (d.source.id === 's8Y2f' && d.target.id === 'y9W5d') ||
                (d.source.id === 'k4W1c' && d.target.id === 'y9W5d')
              ) {
                return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
              }
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
              
            `
                )
                .style('left', event.pageX + 5 + 'px')
                .style('top', event.pageY - 28 + 'px');
            })
            .on('mouseout', () => {
              tooltip.transition().duration(500).style('opacity', 0);
            });

          g.selectAll('.correct-link')
            .data(links)
            .enter()
            .append('path')
            .attr('class', 'correct-link')
            .attr('d', (d) => {
              if (
                (d.source.id === 'y9W5d' && d.target.id === 'k4W1c') ||
                (d.source.id === 'y9W5d' && d.target.id === 's8Y2f') ||
                (d.source.id === 's8Y2f' && d.target.id === 'y9W5d') ||
                (d.source.id === 'k4W1c' && d.target.id === 'y9W5d')
              ) {
                const adjustedYSource = d.source.y - 5;
                const adjustedYTarget = d.target.y - 5;
                return `M${d.source.x},${adjustedYSource} L${d.target.x},${adjustedYTarget}`;
              }
              const dx = d.target.x - d.source.x;
              const isForward =
                knowledgeSequence.indexOf(d.source.id) <
                knowledgeSequence.indexOf(d.target.id);
              const dy = isForward ? -170 : 170;
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
              <strong>学习顺序:</strong> ${d.source.id}<br>
              <strong>提交次数:</strong> ${d.target.id}<br>
              <strong>正确提交次数:</strong> ${d.correct_count}<br>
              
            `
                )
                .style('left', event.pageX + 5 + 'px')
                .style('top', event.pageY - 28 + 'px')
                .style('background-color', '#EAF1FF')
                .style('border', '1px solid #3C7DF3')
                .style('border-radius', '8px')
                .style('z-index', '100');
            })
            .on('mouseout', () => {
              tooltip.transition().duration(500).style('opacity', 0);
            });

          g.selectAll('.node')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', 10)
            .attr('cx', (d) => d.x)
            .attr('cy', (d) => d.y);

          g.selectAll('.label')
            .data(nodes)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', (d) => d.x)
            .attr('y', (d) => d.y + 30)
            .attr('text-anchor', 'middle')
            .style('font-size', '15px')
            .text((d) => d.id);
        });
      })
      .catch((error) => {
        console.error('Error loading the JSON file:', error);
      });
  },
};
</script>

<style scoped>
::v-deep .node {
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

.container {
  display: flex;
  justify-content: space-between;
  gap: 3px;
  width: 730px; /* Set the desired container width */
  height: 410px; /* Set the desired container height */
  overflow-y: scroll; /* Enable vertical scrolling */
  border: 1px solid #ccc; /* Add a border for visual reference */
  padding: 10px;
}

/* .column {
  width: 50%;
 
} */

.tooltip {
  position: absolute;
  padding: 8px;
  width: 200px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  pointer-events: none;
  opacity: 0;
}

.label {
  font-size: 20px; /* Adjust node label font size here */
}
.top-main {
  position: relative;
}
.map-title {
  position: absolute;
  top: 5px;
  right: 40px;
  text-align: right;
  /* left: 10px; */
  padding: 2px 10px;
  color: #365daa;
  font-size: 24px;
}
.pic {
  position: absolute;
  top: -30px;
  left: 32%;
  /* width: 200px; */
  /* height: 100px; */
}
.pic img {
  width: 390px;
  height: 90px;
  object-fit: contain;
}
</style>
