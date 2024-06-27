<template>
  <div>
    <div id="mainChart" ref="chartContainer">
      <div class="map-title">学生整体信息视图</div>
      <div class="map-pic">
        <img src="pic_hd.jpg" />
      </div>
      <div class="tooltip" id="tooltip"></div>
    </div>
  </div>
</template>

<script>
// import mainMapGenerate from './generateMainMap';
import * as d3 from 'd3';

export default {
  name: 'MainMap',
  props: {
    mainMapData: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  computed: {
    width() {
      return 1100 - this.margin.left - this.margin.right;
    },
    height() {
      return 1250 - this.margin.top - this.margin.bottom;
    },
    centerX() {
      return this.width / 2;
    },
    centerY() {
      return this.height / 2;
    },
  },
  watch: {
    mainMapData: {
      handler() {
        this.renderChart();
      },
      deep: true,
    },
  },
  data() {
    return {
      margin: { top: 5, right: 5, bottom: 5, left: 5 },
      radius: 280,
      svg: null,
      container: null,
      zoom: null,
      initialScale: 0.2, // 初始缩放比例，可以根据需要调整

      // 可以存放排序类型，用于后续可能的逻辑判断
      sortType: '',
    };
  },

  mounted() {},

  methods: {
    renderChart() {
      const chartWidth = this.width + this.margin.left + this.margin.right;
      const chartHeight = this.height + this.margin.top + this.margin.bottom;
      const centerX = this.centerX;
      const centerY = this.centerY;

      if (this.$refs.chartContainer) {
        d3.select(this.$refs.chartContainer).select('svg').remove();
      }
      const svg = d3
        .select(this.$refs.chartContainer)
        .append('svg')
        .attr('width', chartWidth)
        .attr('height', chartHeight);

      this.container = svg.append('g');
      this.zoom = d3.zoom().scaleExtent([0.3, 10]).on('zoom', this.zoomed);
      svg
        .call(this.zoom)
        .transition()
        .duration(500)
        .call(this.zoom.scaleTo, this.initialScale);
      const minVal = 0;
      const maxVal = 1;

      const colorScale = d3
        .scaleSequential(d3.interpolateRgb('#7CE9B5', '#FF4975'))
        .domain([minVal, maxVal]);

      const colorScaleBlues = d3
        .scaleSequential(d3.interpolateBlues)
        .domain([0, 20]); // 值域，数值范围从0到100，可以根据实际数据调整

      // const colorScalePurples = d3.scaleSequential(d3.interpolatePurples).domain([0, 20]); // 值域，数值范围从0到100，可以根据实际数据调整

      // const scaleAge = d3.scaleLinear().domain([18, 24]).range([1, 7]);
      this.mainMapData.forEach((axis, index) => {
        const angle = (index / this.mainMapData.length) * 2 * Math.PI; // 计算每个轴的角度位置
        // const currentRadius = axis.ticks.length / 10;
        //+10是留出来的位置
        const dayBetween = axis.ticks.map(({ dayBetween }) => dayBetween + 0);

        const dayBetween0 = axis.ticks.map(({ dayBetween }) => dayBetween);
        const maxData = d3.max(dayBetween0);
        // console.log(maxData);

        // 创建比例尺
        const scale = d3
          .scaleLinear()
          .domain([-6, d3.max(dayBetween)])
          .range([0, 5 * this.radius]);
        // console.log(d3.max(dayBetween));

        // 创建轴并旋转到对应角度
        const axisGenerator = d3
          .axisBottom(scale)
          .ticks(axis.ticks.length)
          .tickSize(0)
          .tickFormat(() => ''); //不显示刻度

        this.container
          .append('g')
          .attr(
            'transform',
            `translate(${centerX}, ${centerY}) rotate(${
              (angle * 180) / Math.PI
            })`
          )
          .call(axisGenerator)
          .attr('class', axis.sex)
          .select('.domain') // 选择.axis path, 对应于坐标轴线
          .style('stroke', colorScale(axis.accuracy))
          .style('stroke-width', 4); // yourColor 替换为你想要的颜色，如 '#ff0000' 表示红色

        // 为每个轴的每个刻度添加圆形
        axis.ticks.forEach((tickValue) => {
          // console.log(tickValue);
          const tickRadius = scale(tickValue.dayBetween);
          const tickPositionX = centerX + tickRadius * Math.cos(angle);
          const tickPositionY = centerY + tickRadius * Math.sin(angle);

          // 计算矩形中心点，这里假设矩形是正方形，所以宽度和高度的一半作为偏移
          const rectCenterX = tickPositionX;
          const rectCenterY = tickPositionY;

          const tooltip = d3.select('#tooltip');

          // 添加矩形并旋转，注意transform的语法
          this.container
            .append('circle')
            .attr('cx', rectCenterX) // 基于矩形中心调整x坐标
            .attr('cy', rectCenterY)
            // .attr("r", 10) // 半径大小，根据需要调整
            .attr('r', 10) // 半径大小，根据需要调整
            .attr('stroke', colorScale(axis.accuracy))
            .attr('stroke-width', 2)
            // .attr('fill', colorScale(tickValue.value));
            .attr('fill', colorScaleBlues(tickValue.value))
            .on('mouseover', function (event) {
              tooltip.transition().duration(200).style('opacity', 0.6);
              tooltip
                .html(`尝试次数 ${tickValue.value}`)
                .style('left', event.pageX + 'px')
                .style('top', event.pageY - 28 + 'px');
            })
            .on('mouseout', function () {
              tooltip.transition().duration(500).style('opacity', 0);
            });
        });

        const zero = scale(maxData);
        // console.log(zero);
        const zeroPositionX = centerX + zero * Math.cos(angle);
        const zeroPositionY = centerY + zero * Math.sin(angle);

        const RectPositionX = zeroPositionX + (axis.age + 1) * Math.cos(angle);
        const RectPositionY = zeroPositionY + (axis.age + 1) * Math.sin(angle);

        this.container
          .append('line')
          .attr('x1', zeroPositionX)
          .attr('y1', zeroPositionY)
          .attr('x2', RectPositionX)
          .attr('y2', RectPositionY)
          .attr('stroke', '#00FFFF')
          .attr('stroke-width', 2);
        // .attr("opacity", 0.5)
        // .attr("stroke-dasharray", "5, 5");
        const tooltip = d3.select('#tooltip');

        this.container
          .append('circle')
          .attr('cx', RectPositionX) // 基于矩形中心调整x坐标
          .attr('cy', RectPositionY)
          .attr('r', axis.totalAttempts / 2) // 半径大小，根据需要调整
          .attr('fill', '#3C7DF3')
          .attr('opacity', 0.3)
          .on('mouseover', function (event) {
            tooltip.transition().duration(200).style('opacity', 0.6);
            tooltip
              .html(`尝试总次数 ${axis.totalAttempts}`)
              .style('left', event.pageX + 'px')
              .style('top', event.pageY - 50 + 'px')
              .style('background-color', '#EAF1FF')
              .style('border', '1px solid #3C7DF3')
              .style('border-radius', '8px')
              .style('z-index', '100');
          })
          .on('mouseout', function () {
            tooltip.transition().duration(500).style('opacity', 0);
          })
          .on('mouseout', function () {
            tooltip.transition().duration(500).style('opacity', 0);
          });

        const last = scale(d3.max(dayBetween));
        const lastPositionX = centerX + (last + 50) * Math.cos(angle);
        const lastPositionY = centerY + (last + 50) * Math.sin(angle);

        this.container
          .append('text')
          .attr('class', 'axis-label')
          .attr('x', lastPositionX)
          .attr('y', lastPositionY)
          .attr(
            'transform',
            `rotate(${
              (angle * 180) / Math.PI
            }, ${lastPositionX}, ${lastPositionY})`
          )
          .text(axis.name)
          // .text('')
          .style('font-size', '24px')
          // 设置字体颜色
          .style('fill', '#365DAA');
      });
    },
    zoomed(event) {
      this.container.attr('transform', event.transform);
    },
  },
};
</script>

<style scoped>
#mainChart {
  position: relative;
  width: 100%;
  height: 100%;
}
.map-title {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 10px;
  color: #365daa;
  font-size: 24px;
}
.map-pic {
  position: absolute;
  top: -25px;
  right: -15px;
  padding: 10px;
}
img {
  width: 270px;
  height: 250px;
}
/* .tooltip {
  position: absolute;
  text-align: left;
  width: auto;
  height: auto;
  padding: 8px;
  font: 12px sans-serif;
  background-color: #e5e5f8;
  border: 0px;
  border-radius: 8px;
  pointer-events: none;
  opacity: 0;
} */
</style>
