import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const fetchData = async () => {
  const response = await fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
  );
  const data = await response.json();
  return data.data;
};

fetchData().then((dataset) => {
  console.log(dataset[0]);
  const svgWidth = 1600;
  const svgHeight = 800;
  const padding = 40;

  const tooltip = d3
    .select("#svg-container")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  const svg = d3
    .select("#svg-container")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  const parseDate = d3.timeParse("%Y-%m-%d");
  const formatDate = d3.timeFormat("%Y");

  const yScaling = d3
    .scaleLinear()
    .domain([d3.min(dataset, (d) => d[1]), d3.max(dataset, (d) => d[1])])
    .range([svgHeight - padding, padding]);

  const xScaling = d3
    .scaleTime()
    .domain([
      d3.min(dataset, (d) => parseDate(d[0])),
      d3.max(dataset, (d) => parseDate(d[0])),
    ])
    .range([padding, svgWidth - padding]);

  const yAxis = d3.axisLeft(yScaling);
  const xAxis = d3.axisBottom(xScaling).tickFormat(formatDate);

  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${padding}, 0)`)
    .call(yAxis);

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${svgHeight - padding})`)
    .call(xAxis);

  svg
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScaling(parseDate(d[0])))
    .attr("y", (d) => yScaling(d[1]))
    .attr("width", 5)
    .attr("height", (d) => svgHeight - padding - yScaling(d[1]))
    .on("mouseover", function (e, d) {
      d3.select(this).attr("class", "bar highlighted");

      const [year, month] = d[0].split("-").map(Number);
      const quarter =
        month <= 3
          ? "Q1"
          : month <= 6
          ? "Q2"
          : month <= 9
          ? "Q3"
          : month <= "12"
          ? "Q4"
          : "";
      const yValue = d[1];

      tooltip
        .style("opacity", 1)
        .html(`X: ${year} ${quarter}<br>Y: $${yValue} Billion`)
        .style("left", e.pageX + 15 + "px")
        .style("top", e.pageY + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("class", "bar");

      tooltip.style("opacity", 0);
    });
});
