<template>
  <div>
    <h1>Timeconsume</h1>
    <div id="timeconsume-chart"></div>
    <h1>Memory</h1>
    <div id="memory-chart"></div>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "TimeMemory",
  mounted() {
    const margin = { top: 20, right: 200, bottom: 30, left: 200 };
    const width = 1400 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    const squareSize = 10; // Size of each square

    const svg1 = d3
      .select("#timeconsume-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const svg2 = d3
      .select("#memory-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    svg1
      .append("defs")
      .append("clipPath")
      .attr("id", "clip1")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    svg2
      .append("defs")
      .append("clipPath")
      .attr("id", "clip2")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    const g1 = svg1
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .attr("clip-path", "url(#clip1)");

    const g2 = svg2
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .attr("clip-path", "url(#clip2)");

    // Ensure the data file is in the "public" folder or accessible via HTTP request
    d3.csv("/SubmitRecord-Class4.csv").then((data) => {
      const x1 = d3.scaleLinear().domain([0, 45]).range([0, width]).nice();

      const x2 = d3.scaleLinear().domain([0, 800]).range([0, width]).nice();

      const y = d3
        .scaleBand()
        .range([0, height])
        .domain(data.map((d) => d.title_ID))
        .padding(0.1);

      const xAxis1 = svg1
        .append("g")
        .attr("transform", `translate(${margin.left},${height + margin.top})`)
        .call(d3.axisBottom(x1));

      const xAxis2 = svg2
        .append("g")
        .attr("transform", `translate(${margin.left},${height + margin.top})`)
        .call(d3.axisBottom(x2));

      svg1
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .call(d3.axisLeft(y))
        .selectAll(".tick line")
        .remove();

      svg2
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .call(d3.axisLeft(y))
        .selectAll(".tick line")
        .remove();

      const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      const countMap = {};

      data.forEach((d) => {
        const key1 = `${d.title_ID}-${d.timeconsume}`;
        const key2 = `${d.title_ID}-${d.memory}`;
        if (!countMap[key1]) countMap[key1] = 0;
        if (!countMap[key2]) countMap[key2] = 0;
        countMap[key1] += 1;
        countMap[key2] += 1;
      });

      function getFillColor(count) {
        const baseOpacity = 0.05;
        const maxOpacity = 1.0;
        const opacity = Math.min(baseOpacity * count, maxOpacity);
        return `rgba(30, 144, 255, ${opacity})`; // DodgerBlue
      }

      g1.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x1(d.timeconsume))
        .attr("y", (d) => y(d.title_ID))
        .attr("width", squareSize)
        .attr("height", squareSize)
        .attr("fill", (d) =>
          getFillColor(countMap[`${d.title_ID}-${d.timeconsume}`])
        )
        .on("mouseover", function (event, d) {
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(`Count: ${countMap[`${d.title_ID}-${d.timeconsume}`]}`)
            .style("left", event.pageX + 5 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
          tooltip.transition().duration(500).style("opacity", 0);
        });

      g2.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x2(d.memory))
        .attr("y", (d) => y(d.title_ID))
        .attr("width", squareSize)
        .attr("height", squareSize)
        .attr("fill", (d) =>
          getFillColor(countMap[`${d.title_ID}-${d.memory}`])
        )
        .on("mouseover", function (event, d) {
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(`Count: ${countMap[`${d.title_ID}-${d.memory}`]}`)
            .style("left", event.pageX + 5 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
          tooltip.transition().duration(500).style("opacity", 0);
        });

      function zoomed1(event) {
        const transform = event.transform;
        const newX = transform.rescaleX(x1);
        xAxis1.call(d3.axisBottom(newX));
        g1.selectAll(".bar").attr("x", (d) => newX(d.timeconsume));
      }

      function zoomed2(event) {
        const transform = event.transform;
        const newX = transform.rescaleX(x2);
        xAxis2.call(d3.axisBottom(newX));
        g2.selectAll(".bar").attr("x", (d) => newX(d.memory));
      }

      svg1
        .append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .call(
          d3
            .zoom()
            .scaleExtent([1, 10])
            .translateExtent([
              [0, 0],
              [width, height],
            ])
            .extent([
              [0, 0],
              [width, height],
            ])
            .on("zoom", zoomed1)
        );

      svg2
        .append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .call(
          d3
            .zoom()
            .scaleExtent([1, 10])
            .translateExtent([
              [0, 0],
              [width, height],
            ])
            .extent([
              [0, 0],
              [width, height],
            ])
            .on("zoom", zoomed2)
        );
    });
  },
};
</script>

<style>
.tooltip {
  position: absolute;
  text-align: center;
  width: 60px;
  height: 28px;
  padding: 2px;
  font: 12px sans-serif;
  background: lightsteelblue;
  border: 0px;
  border-radius: 8px;
  pointer-events: none;
}
</style>
