<template>
  <div>
    <button @click="() => sendButtonInfoToBackend('frequency')">按次数排序</button>
    <button @click="() => sendButtonInfoToBackend('accuracy')">按正确率排序</button>
    <button @click="() => sendButtonInfoToBackend('days')">按天数排序</button>

    <div id="mainChart" ref="chartContainer"></div>
  </div>
</template>

<script>
// import mainMapGenerate from './generateMainMap';
import * as d3 from 'd3';
import axios from 'axios';

export default {
  name: 'MainMap',
  data() {
    return {
      margin: { top: 5, right: 5, bottom: 5, left: 5 },
      radius: 260,
      svg: null,
      container: null,
      zoom: null,
      axesData: [],
      initialScale: 0.2, // 初始缩放比例，可以根据需要调整

      // 可以存放排序类型，用于后续可能的逻辑判断
      sortType: ''
    };
  },
  computed: {
    width() {
      return 800 - this.margin.left - this.margin.right;
    },
    height() {
      return 800 - this.margin.top - this.margin.bottom;
    },
    centerX() {
      return this.width / 2;
    },
    centerY() {
      return this.height / 2;
    }
  },

  mounted() {
    // mainMapGenerate()
    this.fetchDataAndRenderChart();
  },
  created() {},

  methods: {
    sendButtonInfoToBackend(buttonName) {
      // 发送 POST 请求到后端，携带按钮名称作为参数
      axios
        .get('http://127.0.0.1:3001/student2/sort', {
          params: {
            sortBy: buttonName
          }
        })
        .then(response => {
          console.log('请求成功，后端响应：', response.data);
          // 在这里处理成功的逻辑，比如更新 UI
          this.axesData = response.data;
          this.renderChart();
        })
        .catch(error => {
          console.error('请求失败示：', error);
          // 在这里处理错误，比如提用户
        });
    },
    fetchDataAndRenderChart() {
      axios
        .get('http://127.0.0.1:3001/student2')
        .then(response => {
          this.axesData = response.data;
          console.log(this.axesData);

          this.renderChart();

          // this.generateAxes(response);
        })
        .catch(error => {
          console.log(error);
        });
    },
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
      this.zoom = d3.zoom().scaleExtent([0.01, 3]).on('zoom', this.zoomed);
      svg.call(this.zoom).transition().duration(500).call(this.zoom.scaleTo, this.initialScale);

      // const initialTransform = d3.zoomIdentity.translate(centerX - 200, centerY - 200).scale(0.2);
      // this.container.attr('transform', initialTransform);

      const colorScaleBlues = d3.scaleSequential(d3.interpolateBlues).domain([0, 20]); // 值域，数值范围从0到100，可以根据实际数据调整

      // const colorScaleReds = d3.scaleSequential(d3.interpolateReds).domain([0, 20]); // 值域，数值范围从0到100，可以根据实际数据调整

      // const colorScalePurples = d3.scaleSequential(d3.interpolatePurples).domain([0, 20]); // 值域，数值范围从0到100，可以根据实际数据调整
      // const colorScaleGreens = d3.scaleSequential(d3.interpolateGreens).domain([0, 20]); // 值域，数值范围从0到100，可以根据实际数据调整
      // const colorScaleOranges = d3.scaleSequential(d3.interpolateOranges).domain([0, 20]); // 值域，数值范围从0到100，可以根据实际数据调整

      const scaleAge = d3.scaleLinear().domain([18, 24]).range([1, 7]);
      this.axesData.forEach((axis, index) => {
        const angle = (index / this.axesData.length) * 2 * Math.PI; // 计算每个轴的角度位置
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
          .attr('transform', `translate(${centerX}, ${centerY}) rotate(${(angle * 180) / Math.PI})`)
          .call(axisGenerator)
          .attr('class', axis.sex);

        // 为每个轴的每个刻度添加圆形
        axis.ticks.forEach(tickValue => {
          // console.log(tickValue);
          const tickRadius = scale(tickValue.dayBetween);
          const tickPositionX = centerX + tickRadius * Math.cos(angle);
          const tickPositionY = centerY + tickRadius * Math.sin(angle);

          // 计算矩形中心点，这里假设矩形是正方形，所以宽度和高度的一半作为偏移
          const rectCenterX = tickPositionX;
          const rectCenterY = tickPositionY;

          // 添加矩形并旋转，注意transform的语法
          this.container
            .append('circle')
            .attr('cx', rectCenterX) // 基于矩形中心调整x坐标
            .attr('cy', rectCenterY)
            // .attr("r", 10) // 半径大小，根据需要调整
            .attr('r', 10) // 半径大小，根据需要调整
            .attr('stroke', function () {
              switch (axis.sex) {
                case 'male':
                  return 'blue';
                case 'female':
                  return 'red';
                default:
                  return 'black';
              }
            })
            // .attr("stroke-width", 2)
            .attr('fill', colorScaleBlues(tickValue.value));
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
          .attr('stroke-width', scaleAge(axis.age));
        // .attr("opacity", 0.5)
        // .attr("stroke-dasharray", "5, 5");

        this.container
          .append('circle')
          .attr('cx', RectPositionX) // 基于矩形中心调整x坐标
          .attr('cy', RectPositionY)
          .attr('r', axis.totalAttempts / 2) // 半径大小，根据需要调整
          .attr('fill', '#41D7EB')
          .attr('opacity', 0.3);

        const last = scale(d3.max(dayBetween));
        const lastPositionX = centerX + (last + 40) * Math.cos(angle);
        const lastPositionY = centerY + (last + 40) * Math.sin(angle);

        this.container
          .append('text')
          .attr('class', 'axis-label')
          .attr('x', lastPositionX)
          .attr('y', lastPositionY)
          .text(index + 1);
      });
    },
    zoomed(event) {
      this.container.attr('transform', event.transform);
    }
  }
};
</script>

<style>
.female path {
  /* visibility: hidden; */
  stroke: #ad009c;
  /* stroke-width: 3; */
}

.male path {
  /* visibility: hidden; */
  stroke: #000082;
  /* stroke-width: 3; */
}
</style>
