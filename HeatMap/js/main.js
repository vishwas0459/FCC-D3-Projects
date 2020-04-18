// 'use strict';
const margin = { top: 50, right: 50, bottom: 50, left: 70 };
const WIDTH = 1000 - margin.left - margin.right;
const HEIGHT = 500 - margin.top - margin.bottom;

const URL =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
let dataset = [];

// ATTACH SVG CANVAS
const heatMapSVG = d3
  .select('#heatmap')
  .append('svg')
  .attr('width', WIDTH + margin.left + margin.right)
  .attr('height', HEIGHT + margin.top + margin.bottom)
  .append('g') // group so that we can add both axis
  .attr('transform', `translate(${margin.left}, ${margin.top})`); // add some margin to visualization
// .attr('fill', 'grey');

// Attach legendSVG
const legendSVG = d3
  .select('#legend')
  .append('svg')
  .attr('width', '200')
  .attr('height', '200');

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
  .attr('height', 'auto');

//  Handle mouse events
const mouseover = d => {
  tooltip
    .attr('data-year', d.year)
    .style('display', 'inline-block')
    .html(
      `<span>${d.year} - ${d3.timeFormat('%b')(
        new Date(2010, d.month - 1, 1)
      )}</span>
      </br>
    <span>${(d.variance + baseTemperature).toFixed(2)}&#8451;</span>
    </br>
    <span>${d.variance}&#8451;</span>
    `
    )
    .style('left', `${d3.event.clientX + 10}px`)
    .style('top', `${d3.event.clientY + 10}px`);
};
const mouseleave = d => {
  tooltip.style('display', 'none');
};

const xScale = d3.scaleLinear().range([0, WIDTH]);
const yScale = d3.scaleTime().range([20, HEIGHT - 20]);
let baseTemperature = null;
//LOAD DATA
d3.json(URL)
  .then(data => {
    dataset = data.monthlyVariance;
    baseTemperature = data.baseTemperature;
    let tempVariance = dataset.map(d => d.variance);
    // console.log('tempvariance', d3.extent(tempVariance));
    let yearDataset = [];
    dataset
      .map(data => data.year)
      .forEach(data => {
        if (yearDataset.indexOf(data) === -1) yearDataset.push(data);
      });
    xScale.domain(d3.extent(yearDataset));
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));

    const colorScale = d3
      .scaleQuantize()
      .domain([baseTemperature - 6.976, baseTemperature + 5.228])
      .range(d3.schemeSet1);

    // display
    heatMapSVG
      .append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0,${HEIGHT})`)
      .call(xAxis);

    // Yscale
    let timeDataset = [];
    for (let i = 0; i < 12; i++) {
      timeDataset.push(new Date(2010, i, 1));
    }
    // console.log(d3.extent(timeDataset));
    yScale.domain(d3.extent(timeDataset));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%B'));
    // verify yScales
    // console.log(yScale(new Date(2010, 11, 1)));

    // display
    heatMapSVG
      .append('g')
      .attr('id', 'y-axis')
      // .attr('transform', `translate(0,${HEIGHT})`)
      .call(yAxis);

    // now plot the data on svg
    heatMapSVG
      .selectAll('rects')
      .data(dataset)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('width', '3px')
      .attr('height', '40px')
      .attr('fill', d => colorScale(d.variance + baseTemperature))
      .attr('x', d => xScale(d.year))
      .attr('y', d => yScale(new Date(2010, d.month - 1, 1)))
      .attr('data-month', d =>
        d3.timeFormat('%B')(new Date(2010, d.month - 1, 1))
      )
      .attr('data-year', d => d.year)
      .attr('data-temp', d => d.variance)
      .on('mouseover', mouseover)
      .on('mouseleave', mouseleave)
      .attr('transform', d => `translate(2,-20)`);

    // change tick position
    // d3.selectAll('#y-axis .tick line').forEach(tikcPostion => {
    //   d3.select(this).attr('transform',`translate(0,)`)
    // })
  })
  .catch(err => console.log(err));
