import * as d3 from 'd3';
import axios from 'axios';

function mainMapGenerate() {
  //颜色的深浅，代表这一天做题的次数，颜色越深，次数越多
  //原始的数据已经做了排序，先计算得0分的情况,再计算1-0的比率，进行降序排列
  const margin = { top: 5, right: 5, bottom: 5, left: 5 };
  const width = 2000 - margin.left - margin.right;

  const height = 2000 - margin.top - margin.bottom;

  const div = d3.select('body').append('div').attr('id', 'mychart');

  // 创建一个 SVG 元素
  const svg = div
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  const radius = 400;
  const centerX = width / 2;
  const centerY = height / 2;

  const container = svg.append('g');

  // 在创建SVG后，添加缩放行为
  const zoom = d3
    .zoom()
    .scaleExtent([0.1, 10]) // 设置缩放范围，这里是10%到10倍
    .on('zoom', zoomed);

  svg.call(zoom);

  function zoomed(event) {
    // 在这里，您需要基于当前的缩放和转换来更新图表中的元素

    container.attr('transform', event.transform);

    // // 更新所有依赖于缩放和平移的元素，比如轴、圆形等
    // svg.selectAll("g.axis").attr("transform", `translate(${transform.x}, ${transform.y})scale(${transform.k})`);
    // svg.selectAll("circle").attr("transform", `translate(${transform.x}, ${transform.y})scale(${transform.k})`);
  }

  axios.get('http://127.0.0.1:3001/student2').then(function (response) {
    const axesData = response.data;

    // let scale;
    // let angle;

    const colorScaleBlues = d3.scaleSequential(d3.interpolateBlues).domain([0, 20]); // 值域，数值范围从0到100，可以根据实际数据调整

    const colorScaleReds = d3.scaleSequential(d3.interpolateReds).domain([0, 20]); // 值域，数值范围从0到100，可以根据实际数据调整

    const colorScalePurples = d3.scaleSequential(d3.interpolatePurples).domain([0, 20]); // 值域，数值范围从0到100，可以根据实际数据调整
    const colorScaleGreens = d3.scaleSequential(d3.interpolateGreens).domain([0, 20]); // 值域，数值范围从0到100，可以根据实际数据调整
    const colorScaleOranges = d3.scaleSequential(d3.interpolateOranges).domain([0, 20]); // 值域，数值范围从0到100，可以根据实际数据调整

    const scaleAge = d3.scaleLinear().domain([18, 24]).range([1, 7]);

    axesData.forEach((axis, index) => {
      const angle = (index / axesData.length) * 2 * Math.PI; // 计算每个轴的角度位置
      const currentRadius = axis.ticks.length / 10;
      //+10是留出来的位置
      const dayBetween = axis.ticks.map(({ dayBetween }) => dayBetween + 40);

      const dayBetween0 = axis.ticks.map(({ dayBetween }) => dayBetween);
      const maxData = d3.max(dayBetween0);
      // console.log(maxData);

      // 创建比例尺
      const scale = d3
        .scaleLinear()
        .domain([-1, d3.max(dayBetween)])
        .range([0, currentRadius * radius]);
      // console.log(d3.max(dayBetween));

      // 创建轴并旋转到对应角度
      const axisGenerator = d3
        .axisBottom(scale)
        .ticks(axis.ticks.length)
        .tickSize(0)
        .tickFormat(() => ''); //不显示刻度

      container
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
        container
          .append('circle')
          .attr('cx', rectCenterX) // 基于矩形中心调整x坐标
          .attr('cy', rectCenterY)
          // .attr("r", 10) // 半径大小，根据需要调整
          .attr('r', 15) // 半径大小，根据需要调整
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
          .attr('fill', function () {
            // console.log(axis.sex);
            switch (axis.major) {
              case 'J23517':
                return colorScaleGreens(tickValue.value);
              case 'J40192':
                return colorScaleOranges(tickValue.value);
              case 'J57489':
                return colorScaleReds(tickValue.value);
              case 'J78901':
                return colorScaleBlues(tickValue.value);
              default:
                return colorScalePurples(tickValue.value);
            }

            // if (axis.sex === "male") {
            //     return colorScaleBlues(tickValue.value);
            // } else {
            //     return colorScaleReds(tickValue.value);
            // }
          });
      });

      const zero = scale(maxData);
      // console.log(zero);
      const zeroPositionX = centerX + zero * Math.cos(angle);
      const zeroPositionY = centerY + zero * Math.sin(angle);

      const RectPositionX = zeroPositionX + (axis.age + 1) * Math.cos(angle);
      const RectPositionY = zeroPositionY + (axis.age + 1) * Math.sin(angle);

      container
        .append('line')
        .attr('x1', zeroPositionX)
        .attr('y1', zeroPositionY)
        .attr('x2', RectPositionX)
        .attr('y2', RectPositionY)
        .attr('stroke', '#00FFFF')
        .attr('stroke-width', scaleAge(axis.age));
      // .attr("opacity", 0.5)
      // .attr("stroke-dasharray", "5, 5");

      container
        .append('circle')
        .attr('cx', RectPositionX) // 基于矩形中心调整x坐标
        .attr('cy', RectPositionY)
        // .attr("r", 10) // 半径大小，根据需要调整
        .attr('r', 12) // 半径大小，根据需要调整
        .attr('fill', 'blue');

      const last = scale(d3.max(dayBetween));
      const lastPositionX = centerX + (last + 0) * Math.cos(angle);
      const lastPositionY = centerY + (last + 0) * Math.sin(angle);

      container
        .append('text')
        .attr('class', 'axis-label') // 为文本添加一个类，以便于样式控制
        .attr('x', lastPositionX + 5) // 假设data是你的数据数组，调整偏移量以适应视觉效果
        .attr('y', lastPositionY) // h是你SVG的高度，调整y值使文本位于适当位置

        .text(index + 1); // 设置文本内容
    });

    // console.log(zero);
    // console.log(axis.age);
  });
}
export default mainMapGenerate;
