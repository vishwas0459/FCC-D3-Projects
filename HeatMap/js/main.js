// 'use strict';
const margin = { top: 50, right: 70, bottom: 50, left: 70 };
const WIDTH = 1000 - margin.left - margin.right;
const HEIGHT = 500 - margin.top - margin.bottom;

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const URL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
let dataset = [];

// ATTACH SVG CANVAS
const heatMapSVG = d3
  .select('#heatmap')
  .append('svg')
  .attr('width', WIDTH + margin.left + margin.right)
  .attr('height', HEIGHT + margin.top + margin.bottom)
  .append('g') // group so that we can add both axis
  .attr('transform', `translate(${margin.left}, ${0})`); // add some margin to visualization

// Attach legendSVG
const legendSVG = d3.select('#legend').append('svg').attr('height', '50').attr('width', `${WIDTH}`).append('g'); // group so that we can add both axis

// label on x axis
heatMapSVG
  .append('text')
  .attr('x', WIDTH / 2)
  .attr('y', HEIGHT + 50)
  .style('font-size', 20)
  .style('font-family', 'verdana')
  .style('color', 'indigo')
  .attr('text-anchor', 'middle')
  .attr('id', 'title')
  .text('Years');

// label on Y axis
heatMapSVG
  .append('text')
  .attr('x', -(HEIGHT / 2) + margin.top)
  .attr('y', -margin.left + 15)
  .style('font-size', 15)
  .style('font-family', 'verdana')
  .attr('text-anchor', 'middle')
  .text('Months')
  .attr('transform', `rotate(-90)`);

// ToolTip
const tooltip = d3
  .select('body')
  .append('div')
  .attr('id', 'tooltip')
  .attr('width', 'auto')
  .attr('height', 'auto')
  .style('display', 'none');
//  Handle mouse events
const mouseover = d => {
  tooltip
    .attr('data-year', d.year)
    .style('display', 'inline-block')
    .html(
      `<span>${d.year} - ${monthNames[d.month - 1]}</span>
      </br>
    <span>${(d.variance + baseTemperature).toFixed(1)}&#8451;</span>
    </br>
    <span>${d.variance.toFixed(1)}&#8451;</span>
    `
    )
    .style('left', `${d3.event.clientX + 10}px`)
    .style('top', `${d3.event.clientY + 10}px`);
};
const mouseleave = d => {
  tooltip.style('display', 'none');
};

const xScale = d3.scaleLinear().range([0, WIDTH]);
const yScale = d3.scaleBand().range([0, HEIGHT]);
let baseTemperature = null;

const colorPallete = [
  '#f1c27d',
  '#ffdbac',
  '#e0ac69',
  '#c68642',
  '#8d5524',
  '#b2d8d8',
  '#66b2b2',
  '#008080',
  '#006666',
  '#004c4c',
  '#003333',
];
//LOAD DATA
d3.json(URL)
  .then(data => {
    dataset = data.monthlyVariance;
    baseTemperature = data.baseTemperature;
    let yearDataset = [];
    dataset
      .map(data => data.year)
      .forEach(data => {
        if (yearDataset.indexOf(data) === -1) yearDataset.push(data);
      });
    xScale.domain(d3.extent(yearDataset));
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));

    let tempVariance = dataset.map(d => d.variance + baseTemperature);
    let tempDelta = (d3.max(tempVariance, d => d) / 10).toFixed(1);
    let legendDomain = [];
    for (let i = 0; i <= 10; i++) {
      legendDomain.push(+(i * tempDelta).toFixed(1));
    }

    const colorScale = d3
      .scaleThreshold()
      .domain(legendDomain)
      // used https://www.color-hex.com/ to get below color pallets
      .range(colorPallete);

    const legendXScale = d3
      .scaleLinear()
      .domain(d3.extent(legendDomain))
      .range([200, WIDTH - 200]);

    const legendAxis = d3
      .axisBottom(legendXScale)
      .tickSize(25)
      .tickValues([...legendDomain])
      .tickFormat(d3.format('.1f'));

    const temp = legendSVG.append('g').call(legendAxis);
    // temp.select('.domain').remove();

    temp
      .selectAll('rects')
      .data(
        colorScale.range().map(clr => {
          let invertClr = colorScale.invertExtent(clr);
          if (invertClr[0] == null || undefined) invertClr[0] = legendXScale.domain()[0];
          if (invertClr[1] == null || undefined) invertClr[1] = legendXScale.domain()[1];
          return invertClr;
        })
      )
      .enter()
      .insert('rect', '.tick')
      .attr('height', 18)
      .attr('x', function (d) {
        return legendXScale(d[0]);
      })
      .attr('width', function (d) {
        return legendXScale(d[1]) - legendXScale(d[0]);
      })
      .attr('fill', function (d) {
        return colorScale(d[0]);
      })
      .attr('stroke', 'black');
    // display
    heatMapSVG.append('g').attr('id', 'x-axis').attr('transform', `translate(1,${HEIGHT})`).call(xAxis);

    // Yscale
    let timeDataset = [];
    for (let i = 0; i < 12; i++) {
      timeDataset.push(i);
    }
    yScale.domain(timeDataset);

    // console.log('verify yScale', yScale(0));
    const yAxis = d3
      .axisLeft(yScale)
      .tickValues(yScale.domain())
      .tickFormat(d => monthNames[d]);
    // display
    heatMapSVG.append('g').attr('id', 'y-axis').attr('transform', `translate(-1,0)`).call(yAxis);

    // now plot the data on svg
    heatMapSVG
      .selectAll('rects')
      .data(dataset)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('width', WIDTH / (d3.max(dataset, d => d.year) - d3.min(dataset, d => d.year)))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.variance + baseTemperature))
      .attr('x', d => xScale(d.year))
      .attr('y', d => yScale(d.month - 1))
      .attr('data-month', d => d.month - 1)
      .attr('data-year', d => d.year)
      .attr('data-temp', d => d.variance)
      .on('mouseover', mouseover)
      .on('mouseleave', mouseleave);
  })
  .catch(err => console.log(err));
