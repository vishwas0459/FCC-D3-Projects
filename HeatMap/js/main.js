// 'use strict';
const margin = { top: 50, right: 50, bottom: 50, left: 70 };
const WIDTH = 700 - margin.left - margin.right;
const HEIGHT = 500 - margin.top - margin.bottom;

const URL =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
let dataset = [];

// ATTACH SVG CANVAS
const svg = d3
  .select('#heatmap')
  .append('svg')
  .attr('width', WIDTH + margin.left + margin.right)
  .attr('height', HEIGHT + margin.top + margin.bottom)
  .append('g') // group so that we can add both axis
  .attr('transform', `translate(${margin.left}, ${margin.top})`); // add some margin to visualization
// .attr('fill', 'grey');

// label
svg
  .append('text')
  .attr('x', WIDTH / 2)
  .attr('y', 0)
  .style('font-size', 30)
  .style('font-family', 'verdana')
  .style('color', 'indigo')
  .attr('text-anchor', 'middle')
  .attr('id', 'title')
  .text('HeatMap');

// ToolTip
const tooltip = d3
  .select('body')
  .append('div')
  .attr('id', 'tooltip')
  .attr('width', 'auto')
  .attr('height', 'auto');

const xScale = d3.scaleLinear().range([15, WIDTH - 15]);

const yScale = d3.scaleTime().range([15, HEIGHT - 15]);

//  Handle mouse events
const mouseover = d => {
  console.log('d3.event.clientX', d3.event.clientX);
  console.log('d3.event.clientY', d3.event.clientY);

  tooltip
    .attr('data-year', d.Year)
    .style('display', 'inline-block')
    .html(
      `<span>${d.Name} : ${d.Nationality}</span>
      </br>
    <span>${d.Year} : ${d.Time}</span>
    </br>
    <span>${d.Doping}</span>
    `
    )
    .style('left', `${d3.event.clientX + 10}px`)
    .style('top', `${d3.event.clientY + 10}px`);
};
const mouseleave = d => {
  tooltip.style('display', 'none');
};

//LOAD DATA
d3.json(URL)
  .then(data => {
    dataset = data.monthlyVariance;
    let yearDataset = [];
    dataset
      .map(data => data.year)
      .forEach(data => {
        if (yearDataset.indexOf(data) === -1) yearDataset.push(data);
      });
    xScale.domain(d3.extent(yearDataset));
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));

    // display
    svg
      .append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0,${HEIGHT})`)
      .call(xAxis);

    // console.log(d3.timeFormat('%B')(new Date(2010, 0, 1)));
    let timeDataset = [];
    for (let i = 0; i < 12; i++) {
      timeDataset.push(new Date(2010, i, 1));
    }
    yScale.domain(d3.extent(timeDataset));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%B'));

    svg.append('g').attr('id', 'y-axis').call(yAxis);
  })
  .catch(err => console.log(err));
