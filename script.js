// color code: #f6c453(yellow) #fefbe9(beige) #f0a04b(orange) #183a1d(dark green) #e1eedd(light green)
const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

var width = 800;
var height = 600;

var svg = d3
  .select("#root")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

var tooltip = d3
  .select("#root")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

d3.json(url).then((data) => {
  const baseTemp = data["baseTemperature"];
  const monthlyVar = data["monthlyVariance"];
  svg
    .append("text")
    .attr("x", 215)
    .attr("y", 50)
    .attr("font-size", 20)
    .attr("id", "title")
    .style("fill", "#f0a04b")
    .style("text-shadow", "1px 1px 0 #f6c453")
    .text("Monthly Global Land-Surface Temperature");
  svg
    .append("text")
    .attr("x", 270)
    .attr("y", 75)
    .attr("font-size", 15)
    .attr("id", "description")
    .style("fill", "#f0a04b")
    .text("1753 - 2015: base temperature 8.66℃");

  // xScale & xAxis
  var yearsArr = monthlyVar.map((d, i) => {
    return new Date(monthlyVar[i]["year"], 0, 1);
  });
  var xScale = d3
    .scaleTime()
    .domain([d3.min(yearsArr), d3.max(yearsArr)])
    .range([60, width - 100]);
  var xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.timeFormat("%Y"));
  svg
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", "translate(0, 550)");

  // yScale & yAxis
  var monthsArr = monthlyVar.map((d, i) => {
    return new Date(1970, monthlyVar[i]["month"] - 1);
  });
  var yScale = d3
    .scaleTime()
    .domain([d3.max(monthsArr), d3.min(monthsArr)])
    .range([height - 100, 100]);
  var formatMonths = d3.timeFormat("%B");
  var yAxis = d3.axisLeft().scale(yScale).tickFormat(formatMonths);
  svg
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis")
    .attr("transform", "translate(60, 50)");

  // color scale
  var varArr = monthlyVar.map((d, i) => {
    return monthlyVar[i]["variance"];
  });
  var colorScale = d3
    .scaleThreshold()
    .domain(d3.range(baseTemp + d3.min(varArr), baseTemp + d3.max(varArr), 1.1))
    .range([
      "rgb(49, 54, 149)",
      "rgb(69, 117, 180)",
      "rgb(116, 173, 209)",
      "rgb(171, 217, 233)",
      "rgb(224, 243, 248)",
      "rgb(255, 255, 191)",
      "rgb(254, 224, 144)",
      "rgb(253, 174, 97)",
      "rgb(244, 109, 67)",
      "rgb(215, 48, 39)",
    ]);

  var heatMap = svg.append("g").attr("class", "heatmap");

  // dataArr: array of arrays
  // dataArr[i][0]: year, dataArr[i][1]: month, dataArr[i][2]: variance
  function add(a, b) {
    return a + b;
  }

  var dataArr = monthlyVar.map((d, i) => {
    return [
      monthlyVar[i]["year"],
      monthlyVar[i]["month"] - 1,
      monthlyVar[i]["variance"],
    ];
  });
  var numYears =
    d3.max(monthlyVar, (d) => d.year) - d3.min(monthlyVar, (d) => d.year);
  heatMap
    .selectAll("rect")
    .data(dataArr)
    .enter()
    .append("rect")
    .attr("data-year", (d) => d[0])
    .attr("data-month", (d) => d[1])
    .attr("data-temp", (d) => add(baseTemp, d[2]))
    .attr("x", (d) => xScale(new Date(d[0], 0)))
    .attr("y", (d) => yScale(new Date(1970, d[1])))
    .attr("class", "cell")
    .attr("width", width / numYears)
    .attr("height", height / 12)
    .style("fill", (d) => colorScale(add(baseTemp, d[2])));

  // legend
  var legendItems = [
    "2.8",
    "3.9",
    "5.0",
    "6.1",
    "7.2",
    "8.3",
    "9.5",
    "10.6",
    "11.7",
    "12.8",
  ];
  var legend = svg
    .append("g")
    .attr("id", "legend")
    .style("font-size", "14px")
    .attr("transform", "translate(" + (width - 50) + ", 220)");
  var legendItems = legend
    .selectAll(".legend-item")
    .data(legendItems)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", function (d, i) {
      return "translate(0," + i * 20 + ")";
    });
  legendItems
    .append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", function (d) {
      return colorScale(d);
    });

  legendItems
    .append("text")
    .attr("x", 20)
    .attr("y", 10)
    .text(function (d) {
      return d;
    });

  // tooltip
  console.log(data);
  console.log(data["monthlyVariance"][0]["year"]);
  d3.selectAll("rect")
    .on("mouseover", function (event, d) {
      console.log(d);
      // d: year, month in 0-11, var
      var year = d[0];
      tooltip.transition().duration(200).style("opacity", 0.7);
      tooltip
        .html(
          d[0] +
            " - " +
            formatMonths(new Date(1970, d[1])) +
            "<br>" +
            add(baseTemp, d[2]).toFixed(1) +
            "°C" +
            "<br>" +
            d[2].toFixed(1) +
            "°C"
        )
        .attr("data-year", d[0])
        .style("left", event.pageX + 20 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", function () {
      tooltip.transition().duration(200).style("opacity", 0);
    });
});
