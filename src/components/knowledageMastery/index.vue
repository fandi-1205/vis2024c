<template>
  <div id="knowledge-mastery">
    <div ref="chart"></div>
    <div class="tooltip" ref="tooltip"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'KnowledgeMastery',
  data() {
    return {
      width: 1500,
      height: 300,
    };
  },
  mounted() {
    this.createChart();
  },
  methods: {
    createChart() {
      const width = this.width;
      const height = this.height;
      const tooltip = d3
        .select(this.$refs.tooltip)
        .style('opacity', 0)
        .style('background', 'rgba(255, 255, 255, 0.8)')
        .style('text-align', 'left');

      Promise.all([
        d3.csv('/SubmitRecord-Class1.csv'),
        d3.csv('/Data_TitleInfo.csv'),
      ]).then(([classData, titleInfoData]) => {
        let titleInfoMap = {};
        titleInfoData.forEach((d) => {
          titleInfoMap[d.title_ID] = {
            score: +d.score,
            knowledge: d.knowledge,
            sub_knowledge: d.sub_knowledge,
          };
        });

        let studentDataMap = {};
        classData.forEach((d) => {
          let studentID = d.student_ID;
          if (!studentDataMap[studentID]) {
            studentDataMap[studentID] = [];
          }
          studentDataMap[studentID].push(d);
        });

        Object.keys(studentDataMap).forEach((studentID) => {
          let learnerData = studentDataMap[studentID];

          let knowledgeMap = {};
          learnerData.forEach((d) => {
            let title = titleInfoMap[d.title_ID];
            if (title) {
              let knowledge = title.knowledge;
              let sub_knowledge = title.sub_knowledge;
              if (!knowledgeMap[knowledge]) {
                knowledgeMap[knowledge] = {
                  totalScore: 0,
                  correctScore: 0,
                  count: 0,
                  sub_knowledge: {},
                };
              }
              if (!knowledgeMap[knowledge].sub_knowledge[sub_knowledge]) {
                knowledgeMap[knowledge].sub_knowledge[sub_knowledge] = {
                  totalScore: 0,
                  correctScore: 0,
                  count: 0,
                  titles: {},
                };
              }
              knowledgeMap[knowledge].totalScore += title.score;
              knowledgeMap[knowledge].correctScore += +d.score;
              knowledgeMap[knowledge].count += 1;
              knowledgeMap[knowledge].sub_knowledge[sub_knowledge].totalScore +=
                title.score;
              knowledgeMap[knowledge].sub_knowledge[
                sub_knowledge
              ].correctScore += +d.score;
              knowledgeMap[knowledge].sub_knowledge[sub_knowledge].count += 1;

              if (
                !knowledgeMap[knowledge].sub_knowledge[sub_knowledge].titles[
                  d.title_ID
                ]
              ) {
                knowledgeMap[knowledge].sub_knowledge[sub_knowledge].titles[
                  d.title_ID
                ] = {
                  count: 0,
                  totalScore: 0,
                  correctScore: 0,
                  accuracySum: 0,
                };
              }
              knowledgeMap[knowledge].sub_knowledge[sub_knowledge].titles[
                d.title_ID
              ].count += 1;
              knowledgeMap[knowledge].sub_knowledge[sub_knowledge].titles[
                d.title_ID
              ].totalScore = title.score;
              knowledgeMap[knowledge].sub_knowledge[sub_knowledge].titles[
                d.title_ID
              ].correctScore += +d.score;
              knowledgeMap[knowledge].sub_knowledge[sub_knowledge].titles[
                d.title_ID
              ].accuracySum += +d.score / title.score;
            }
          });

          let knowledgeData = [];
          for (let knowledge in knowledgeMap) {
            let kData = knowledgeMap[knowledge];
            let accuracy = kData.correctScore / kData.totalScore;
            let subKnowledgeData = [];
            for (let sub_knowledge in kData.sub_knowledge) {
              let skData = kData.sub_knowledge[sub_knowledge];
              let subAccuracy = skData.correctScore / skData.totalScore;
              let titles = [];
              for (let title_ID in skData.titles) {
                let tData = skData.titles[title_ID];
                let titleAccuracy = tData.accuracySum / tData.count;
                titles.push({
                  title_ID: title_ID,
                  count: tData.count,
                  accuracy: titleAccuracy,
                });
              }
              subKnowledgeData.push({
                sub_knowledge: sub_knowledge,
                accuracy: subAccuracy,
                count: skData.count,
                titles: titles,
              });
            }
            knowledgeData.push({
              knowledge: knowledge,
              accuracy: accuracy,
              count: kData.count,
              subKnowledgeData: subKnowledgeData,
            });
          }

          let radiusScale = d3
            .scaleSqrt()
            .domain([0, d3.max(knowledgeData, (d) => d.count)])
            .range([32, 96]);

          let subRadiusScale = d3
            .scaleSqrt()
            .domain([
              0,
              d3.max(knowledgeData, (d) =>
                d3.max(d.subKnowledgeData, (sk) => sk.count)
              ),
            ])
            .range([24, 37]);

          let tinyRadiusScale = d3
            .scaleSqrt()
            .domain([
              0,
              d3.max(knowledgeData, (d) =>
                d3.max(d.subKnowledgeData, (sk) =>
                  d3.max(sk.titles, (t) => t.count)
                )
              ),
            ])
            .range([4, 15]);

          const svg = d3
            .select(this.$refs.chart)
            .append('svg')
            .attr('width', width)
            .attr('height', height + 50);

          svg
            .append('text')
            .attr('class', 'student-title')
            .attr('x', 300)
            .attr('y', 50)
            .attr('text-anchor', 'middle')
            .style('font-size', '24px')
            .style('font-weight', 'bold')
            .text(`学生ID: ${studentID}`);

          let g = svg
            .selectAll('.knowledge-g')
            .data(knowledgeData)
            .enter()
            .append('g')
            .attr('class', 'knowledge-g')
            .attr(
              'transform',
              (d, i) => `translate(${i * 180 + 120}, ${(height + 200) / 2})`
            );

          g.append('circle')
            .attr('r', (d) => radiusScale(d.count))
            .attr('fill', '#3C7DF3')
            .style('opacity', (d) => d.accuracy);

          g.append('text')
            .attr('class', 'accuracy-label')
            .style('font-size', '10px')
            .attr('dy', (d) => -radiusScale(d.count) * 0.8)
            .text((d) => (d.accuracy * 100).toFixed(1) + '%');

          g.append('text')
            .attr('class', 'knowledge-label')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('y', -110)
            .style('font-size', '15px')
            .text((d) => d.knowledge);

          g.each(function (d) {
            let subG = d3
              .select(this)
              .selectAll('.sub-circle-g')
              .data(d.subKnowledgeData)
              .enter()
              .append('g')
              .attr('class', 'sub-circle-g');

            subG
              .append('circle')
              .attr('class', 'sub-circle')
              .attr('r', (sk) => subRadiusScale(sk.count))
              .attr('fill', '#BE74FC')
              .style('opacity', (sk) => sk.accuracy)
              .on('mouseover', function (event, sk) {
                d3.select(this).attr('fill', '#FF4975').style('opacity', 0.8);

                tooltip.transition().duration(200).style('opacity', 0.9);
                tooltip
                  .html(sk.sub_knowledge)
                  .style('left', event.pageX + 10 + 'px')
                  .style('top', event.pageY + 10 + 'px');
              })
              .on('mouseout', function () {
                d3.select(this)
                  .attr('fill', '#3C7DF3')
                  .style('opacity', (d) => d.accuracy);
                tooltip.transition().duration(500).style('opacity', 0);
              });

            subG
              .append('text')
              .attr('class', 'sub-accuracy-label')
              .attr('dy', (sk) => -subRadiusScale(sk.count) * 1.2)
              .style('font-size', '8px')
              .text((sk) => (sk.accuracy * 100).toFixed(1) + '%');

            let tinyG = subG
              .selectAll('.tiny-circle-g')
              .data((sk) => sk.titles)
              .enter()
              .append('g')
              .attr('class', 'tiny-circle-g');

            tinyG
              .append('circle')
              .attr('class', 'tiny-circle')
              .attr('r', (t) => tinyRadiusScale(t.count))
              .attr('fill', '#7CE9B5')
              .style('fill-opacity', (t) => t.accuracy)
              .style('stroke', '#FF4975')
              .style('stroke-width', (t) => (t.accuracy < 0.1 ? 2 : 0))
              .style('stroke-opacity', 0.8)
              .on('mouseover', function (event, t) {
                d3.select(this)
                  .attr('fill', '#FF4975')
                  .style('fill-opacity', 0.8);

                tooltip.transition().duration(200).style('opacity', 0.9);
                tooltip
                  .html(`题目: ${t.title_ID}<br>答题次数: ${t.count}`)
                  .style('left', event.pageX + 'px')
                  .style('top', event.pageY + 'px');
              })
              .on('mouseout', function () {
                d3.select(this)
                  .attr('fill', '#7CE9B5')
                  .style('fill-opacity', (t) => t.accuracy);
                tooltip.transition().duration(500).style('opacity', 0);
              });

            tinyG
              .append('text')
              .attr('class', 'tiny-circle-text')
              .attr('dy', '.35em')
              .attr('text-anchor', 'middle')
              .text((t) => (t.accuracy * 100).toFixed(1) + '%')
              .style('font-size', '4px')
              .style('fill', '#000');

            // Force simulation for sub-circles
            // eslint-disable-next-line no-unused-vars
            let simulation = d3
              .forceSimulation(d.subKnowledgeData)
              .force('charge', d3.forceManyBody().strength(80))
              .force('center', d3.forceCenter(0, 0))
              .force(
                'collision',
                d3.forceCollide().radius((sk) => subRadiusScale(sk.count))
              )
              .on('tick', () => {
                subG.attr('transform', (sk) => `translate(${sk.x}, ${sk.y})`);
              });

            // Force simulation for tiny circles
            subG.each(function (sk) {
              // eslint-disable-next-line no-unused-vars
              let tinySimulation = d3
                .forceSimulation(sk.titles)
                .force('charge', d3.forceManyBody().strength(8))
                .force('center', d3.forceCenter(0, 0))
                .force(
                  'collision',
                  d3.forceCollide().radius((t) => tinyRadiusScale(t.count) + 2)
                )
                .on('tick', () => {
                  d3.select(this)
                    .selectAll('.tiny-circle-g')
                    .attr('transform', (t) => `translate(${t.x}, ${t.y})`);
                });
            });
          });
        });
      });
    },
  },
};
</script>

<style scoped>
#knowledge-mastery {
  position: relative;
  width: 100%;
  height: 700px;
  overflow-y: scroll; /* Enable vertical scrolling */
}

.tooltip {
  position: absolute;
  text-align: center;
  width: 120px;
  height: 28px;
  padding: 2px;
  font: 12px sans-serif;
  background: lightsteelblue;
  border: 0px;
  border-radius: 8px;
  pointer-events: none;
}
</style>
