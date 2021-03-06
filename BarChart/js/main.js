// 'use strict';
const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const WIDTH = 700 - margin.left - margin.right;
const HEIGHT = 500 - margin.top - margin.bottom;

const URL =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';
let dataset = [];

// ATTACH SVG CANVAS
const svg = d3
  .select(document.getElementById('myCanvas'))
  .append('svg')
  .attr('preserveAspectRatio', 'xMinYMin meet')

  // Add viewBox for responsiveness
  .attr(
    'viewBox',
    `0 0 ${WIDTH + margin.left + margin.right} ${
      HEIGHT + margin.top + margin.bottom
    }`
  )
  .append('g') // group so that we can add both axis
  .attr('transform', `translate(${margin.left}, ${margin.top})`); // add some margin to visualization

// Create a Tooltip
const tooltip = d3
  .select(document.getElementById('myCanvas'))
  .append('div')
  .attr('id', 'tooltip')
  .style('display', 'none');

const mousemove = d => {
  let topY = Math.round(innerHeight * 0.1);
  let x =
    innerWidth - d3.event.clientX < 150
      ? d3.event.clientX - 100
      : d3.event.clientX;

  tooltip.style('left', x + 'px');
  tooltip.style('top', topY + 'px');
  tooltip.attr('data-date', d[0]);
  tooltip.style('display', 'inline-block').html(`
        <p>Date: <span>${d[0]}</span></p>
        <p>$${d[1]} Billion<p>
          `);
};

const mouseleave = d => {
  tooltip.style('display', 'none');
};
const mouseover = d => {
  tooltip.style('display', 'inline-block');
};
// GET THE DATA
d3.json(URL)
  .then(resp => {
    // create empty rects
    dataset = resp.data;

    const rects = svg.selectAll('rect').data(dataset);

    // create scale to contain svg canvas
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(dataset, d => d[1])])
      .range([HEIGHT, 0]);

    const xScale = d3
      .scaleTime()
      .domain([
        d3.min(dataset, d => new Date(d[0])),
        d3.max(dataset, d => new Date(d[0])),
      ])
      .range([0, WIDTH - 10]);

    // GENERATE AXIS
    const xAxis = d3.axisBottom(xScale);
    // .ticks(11);
    svg
      .append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0,${HEIGHT})`)
      .call(xAxis);

    const yAxis = d3.axisLeft(yScale);
    svg.append('g').attr('id', 'y-axis').call(yAxis);

    // display on screen
    rects
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => {
        return xScale(new Date(d[0]));
      })
      .attr('y', d => yScale(d[1]))
      .attr('width', 3)
      .attr('height', d => HEIGHT - yScale(d[1]))
      .attr('fill', 'tomato')
      .attr('data-date', d => d[0])
      .attr('data-gdp', d => d[1])
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave);

    // Create a labels for x-axis
    svg
      .append('text')
      .attr('x', WIDTH / 2)
      .attr('y', 0)
      .style('font-size', 40)
      .style('font-family', 'verdana')
      .style('color', 'indigo')
      .attr('text-anchor', 'middle')
      .attr('id', 'title')
      .text('US GDP');

    // Create a labels for y-axis
    svg
      .append('text')
      .attr('x', -(HEIGHT / 2) + margin.top)
      .attr('y', 20)
      .style('font-size', 15)
      .style('font-family', 'verdana')
      .attr('text-anchor', 'middle')
      .text('Gross Domestic Product')
      .attr('transform', `rotate(-90)`);
  })
  .catch(err => console.log(err));
