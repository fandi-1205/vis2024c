<template>
  <div class="main-top">
    <div class="map-title">答题正确率图</div>
    <div class="pic"><img src="pic41.jpg" alt="img" /></div>
    <div id="knowledge-mastery">
      <div ref="chart"></div>
      <div class="tooltip" ref="tooltip" v-if="tooltipContent"></div>
      <!-- 悬浮框结构 -->
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'KnowledgeMastery',
  data() {
    return {
      width: 1550,
      height: 280,
    };
  },
  mounted() {
    this.createChart();
  },
  methods: {
    createChart() {
      const width = this.width;
      const height = this.height;
      //     读取CSV文件
      Promise.all([
        d3.csv('SubmitRecord-Class4.csv'),
        d3.csv('Data_TitleInfo.csv'),
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

          // 按照固定顺序排序知识点数据
          const fixedOrder = [
            'r8S3g',
            't5V9e',
            'm3D1v',
            'y9W5d',
            'k4W1c',
            's8Y2f',
            'g7R2j',
            'b3C9s',
          ];
          knowledgeData.sort(
            (a, b) =>
              fixedOrder.indexOf(a.knowledge) - fixedOrder.indexOf(b.knowledge)
          );

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
            .attr('height', height + 10);

          svg
            .append('text')
            .attr('class', 'student-title')
            .attr('x', 150)
            .attr('y', 35)
            .attr('text-anchor', 'middle')
            .style('font-size', '15px')
            .style('font-weight', 'bold')
            .text(`Student ID: ${studentID}`);

          let g = svg
            .selectAll('.knowledge-g')
            .data(knowledgeData)
            .enter()
            .append('g')
            .attr('class', 'knowledge-g')
            .attr(
              'transform',
              (d, i) => `translate(${i * 180 + 120}, ${(height + 100) / 2})`
            );

          g.append('circle')
            .attr('r', (d) => radiusScale(d.count))
            .attr('fill', '#97C1FF')
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
              .attr('fill', '#FCD5F8')
              .style('opacity', (sk) => sk.accuracy);
            // .on('mouseover', function (event, sk) {
            //   // 鼠标悬停事件处理程序
            //   const currentSubKnowledge = sk.sub_knowledge; // 获取当前子知识点名称

            //   // 选择所有与当前子知识点名称相同的圆，并高亮显示
            //   d3.selectAll(`.sub-circle`)
            //     .filter((d) => d.sub_knowledge === currentSubKnowledge)
            //     .attr('fill', '#FF4975') // 改变填充颜色
            //     .style('opacity', 1); // 改变透明度
            // })
            // .on('mouseout', function (event, sk) {
            //   // 鼠标移出事件处理程序
            //   const currentSubKnowledge = sk.sub_knowledge; // 获取当前子知识点名称

            //   // 恢复所有与当前子知识点名称相同的圆的原始样式
            //   d3.selectAll(`.sub-circle`)
            //     .filter((d) => d.sub_knowledge === currentSubKnowledge)
            //     .attr('fill', '#FCD5F8') // 恢复原始填充颜色
            //     .style('opacity', (sk) => sk.accuracy); // 恢复原始透明度
            // });

            subG
              .append('text')
              .attr('class', 'sub-accuracy-label')
              .attr('dy', (sk) => -subRadiusScale(sk.count) * -1)
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
              .attr('fill', '#94F5C7')
              .style('fill-opacity', (t) => t.accuracy)
              .style('stroke', '#FF4975')
              .style('stroke-width', (t) => (t.accuracy < 0.1 ? 2 : 0))
              .style('stroke-opacity', 0.8);
            // .on('mouseover', function (event, t) {
            //   // 鼠标悬停事件处理程序
            //   const currentTitleID = t.title_ID; // 获取当前题目 ID

            //   // 选择所有与当前题目 ID 相同的小圆，并高亮显示
            //   d3.selectAll(`.tiny-circle`)
            //     .filter((d) => d.title_ID === currentTitleID)
            //     .attr('fill', '#FF4975') // 改变填充颜色
            //     .style('opacity', 1); // 改变透明度
            // })
            // .on('mouseout', function (event, t) {
            //   // 鼠标移出事件处理程序
            //   const currentTitleID = t.title_ID; // 获取当前题目 ID

            //   // 恢复所有与当前题目 ID 相同的小圆的原始样式
            //   d3.selectAll(`.tiny-circle`)
            //     .filter((d) => d.title_ID === currentTitleID)
            //     .attr('fill', '#7CE9B5') // 恢复原始填充颜色
            //     .style('opacity', (t) => t.accuracy) // 恢复原始透明度
            //     .style('stroke-width', (t) => (t.accuracy < 0.1 ? 2 : 0)); // 恢复描边宽度
            // });

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
  width: 1620px;
  height: 650px;
  overflow-y: scroll; /* Enable vertical scrolling */
  /* 横向禁止滚动 */
  overflow-x: hidden;
}
.tooltip {
  /* position: absolute; */
  background-color: white;
  border: 1px solid #ccc;
  padding: 10px;
  z-index: 10;
  pointer-events: none; /* 防止悬浮框本身影响鼠标事件 */
}
.main-top {
  position: relative;
}
.map-title {
  position: absolute;
  /* float: right; */
  right: 50px;
  /* top: 10px;
  left: 10px; */
  /* text-align: right; */
  padding: 5px 10px;
  color: #365daa;
  font-size: 24px;
}
.pic {
  position: absolute;
  right: 30px;
  top: 10px;
}
.pic img {
  width: 120px;
  height: 450px;
}
</style>
