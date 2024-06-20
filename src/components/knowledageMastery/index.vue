<template>
  <div>
    <svg ref="svg"></svg>
    <div ref="tooltip" class="tooltip"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'KnowledgeMastery',
  methods: {
    async loadData() {
      try {
        const learnerData = await d3.csv('/学习者1.csv');
        const titleInfoData = await d3.csv('/Data_TitleInfo.csv');
        this.renderChart(learnerData, titleInfoData);
      } catch (error) {
        console.error('Error loading the data files:', error);
      }
    },
    renderChart(learnerData, titleInfoData) {
      // 现有的渲染逻辑保持不变
      const width = 1600;
      const height = 300;

      const svg = d3
        .select(this.$refs.svg)
        .attr('width', width)
        .attr('height', height);

      const tooltip = d3
        .select(this.$refs.tooltip)
        .style('opacity', 0)
        .style('background', 'rgba(255, 255, 255, 0.8)')
        .style('text-align', 'left');

      let titleInfoMap = {};
      titleInfoData.forEach((d) => {
        titleInfoMap[d.title_ID] = {
          score: +d.score,
          knowledge: d.knowledge,
          sub_knowledge: d.sub_knowledge,
        };
      });

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
          knowledgeMap[knowledge].sub_knowledge[sub_knowledge].correctScore +=
            +d.score;
          knowledgeMap[knowledge].sub_knowledge[sub_knowledge].count += 1;

          if (
            !knowledgeMap[knowledge].sub_knowledge[sub_knowledge].titles[
              d.title_ID
            ]
          ) {
            knowledgeMap[knowledge].sub_knowledge[sub_knowledge].titles[
              d.title_ID
            ] = { count: 0, totalScore: 0, correctScore: 0, accuracySum: 0 };
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
        .range([24, 42]);

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
        .range([4, 18]);

      let g = svg
        .selectAll('g')
        .data(knowledgeData)
        .enter()
        .append('g')
        .attr(
          'transform',
          (d, i) => `translate(${i * 200 + 120}, ${height / 2})`
        );

      g.append('circle')
        .attr('r', (d) => radiusScale(d.count))
        .attr('fill', '#BE74FC')
        .style('opacity', (d) => d.accuracy);

      g.append('text')
        .attr('class', 'accuracy-label')
        .style('font-size', '10px') /* 确保字体大小已更新 */
        .attr('dy', (d) => -radiusScale(d.count) * 0.8)
        .text((d) => (d.accuracy * 100).toFixed(1) + '%');

      g.append('text')
        .attr('class', 'knowledge-label')
        .attr('text-anchor', 'middle') // 居中对齐
        .attr('dominant-baseline', 'middle') // 垂直居中对齐
        .attr('y', -110)
        .style('font-size', '15px') /* 确保字体大小已更新 */
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
          .attr('fill', '#3C7DF3')
          .style('opacity', (sk) => sk.accuracy)
          .on('mouseover', function (event, sk) {
            d3.select(this).attr('fill', '#FF4975').style('opacity', 0.8);

            tooltip.transition().duration(200).style('opacity', 0.9);
            tooltip
              .html(sk.sub_knowledge)
              .style('left', event.pageX + 5 + 'px')
              .style('top', event.pageY - 28 + 'px');
          })
          .on('mouseout', function (event, sk) {
            d3.select(this)
              .attr('fill', '#3C7DF3')
              .style('opacity', sk.accuracy);
            tooltip.transition().duration(500).style('opacity', 0);
          });

        subG
          .append('text')
          .attr('class', 'sub-accuracy-label')
          .attr('dy', (sk) => -subRadiusScale(sk.count) * 1.2) /* 调整位置 */
          .style('font-size', '8px') /* 确保字体大小已更新 */
          .attr('dy', (sk) => -subRadiusScale(sk.count) * -1)
          .text((sk) => (sk.accuracy * 100).toFixed(1) + '%');

        d3.forceSimulation(d.subKnowledgeData)
          .force('charge', d3.forceManyBody().strength(80))
          .force('center', d3.forceCenter(0, 0))
          .force(
            'collision',
            d3.forceCollide().radius((sk) => subRadiusScale(sk.count))
          )
          .on('tick', () => {
            subG.attr('transform', (sk) => `translate(${sk.x}, ${sk.y})`);
          });

        subG.each(function (sk) {
          let tinyG = d3
            .select(this)
            .selectAll('.tiny-circle-g')
            .data(sk.titles)
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
                .html(`题目: ${t.title_ID}<br>答题次数: ${t.count}`) // 显示题目ID和答题次数
                .style('left', event.pageX + 5 + 'px')
                .style('top', event.pageY - 28 + 'px');
            })
            .on('mouseout', function (event, t) {
              d3.select(this)
                .attr('fill', '#7CE9B5')
                .style('fill-opacity', t.accuracy);
              tooltip.transition().duration(500).style('opacity', 0);
            });

          // 添加文本元素显示正确率
          tinyG
            .append('text')
            .attr('class', 'tiny-circle-text')
            .attr('dy', '.35em')
            .attr('text-anchor', 'middle')
            .text((t) => (t.accuracy * 100).toFixed(1) + '%')
            .style('font-size', '4px')  // 设置文本大小
            .style('fill', '#000');  // 设置文本颜色

          d3.forceSimulation(sk.titles)
            .force('charge', d3.forceManyBody().strength(2))
            .force('center', d3.forceCenter(0, 0))
            .force(
              'collision',
              d3.forceCollide().radius((t) => tinyRadiusScale(t.count))
            )
            .on('tick', () => {
              tinyG.attr('transform', (t) => `translate(${t.x}, ${t.y})`);
            });
        });
      });
    },
  },
  mounted() {
    this.loadData();
  },
};
</script>

<style scoped>
svg .accuracy-label {
  font-size: 10px !important; /* 确保字体大小已更新 */
  font-weight: bold;
  fill: #000;
}

svg .sub-accuracy-label {
  font-size: 10px !important; /* 确保字体大小已更新 */
  font-weight: bold;
  fill: #000;
}

svg .knowledge-label {
  font-size: 5px !important; /* 确保字体大小已更新 */
  font-weight: bold;
  fill: #be74fc;
}

svg .tiny-circle-text {
  font-size: 10px !important; /* 确保字体大小已更新 */
  fill: #000;  /* 设置文本颜色 */
}

svg .tiny-circle-text-sub {
  font-size: 10px !important; /* 确保字体大小已更新 */
  fill: #000;  /* 设置文本颜色 */
}

svg .tiny-circle-text-knowledge {
  font-size: 10px !important; /* 确保字体大小已更新 */
  fill: #be74fc;  /* 设置文本颜色 */
}

.tooltip {
  position: absolute;
  text-align: center;
  width: auto;
  height: auto;
  padding: 5px;
  font: 8px sans-serif !important; /* 确保字体大小已更新 */
  background: lightsteelblue;
  border: 0px solid #000;
  border-radius: 8px;
  pointer-events: none;
  font-size: 8px; /* 设置悬浮框中文本的大小 */
}
</style>


