// 'use strict';
const margin = { top: 50, right: 50, bottom: 70, left: 70 };
const WIDTH = 700 - margin.left - margin.right;
const HEIGHT = 500 - margin.top - margin.bottom;
const URL =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';
let dataset = [];

// ATTACH SVG CANVAS
const svg = d3
  .select(document.getElementById('myCanvas'))
  .append('svg')
  .attr('width', WIDTH + margin.left + margin.right)
  .attr('height', HEIGHT + margin.top + margin.bottom)
  .append('g') // group so that we can add both axis
  .attr('transform', `translate(${margin.left}, ${margin.top})`); // add some margin to visualization

// GET THE DATA
d3.json(URL)
  .then(resp => {
    // create empty rects
    dataset = resp.data;

    const rects = svg.selectAll('rect').data(dataset);
    console.log(d3.max(dataset, d => d[1]));

    // create scale to contain svg canvas
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(dataset, d => d[1])])
      .range([HEIGHT, 0]);
    // console.log(yScale(18064.7)); == 700

    // CREATE xScale band
    const xScale = d3
      .scaleBand()
      .domain(dataset.map(d => d[0].split('-')[0]))
      .range([0, WIDTH])
      .padding(0.07);

    // GENERATE AXIS
    const xAxis = d3.axisBottom(xScale);
    svg.append('g').attr('transform', `translate(0,${HEIGHT})`).call(xAxis);

    const yAxis = d3.axisLeft(yScale);
    svg.append('g').call(yAxis);

    // display on screen
    rects
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(parseInt(d[0].split('-')[0])))
      .attr('y', d => yScale(d[1]))
      .attr('width', xScale.bandwidth)
      .attr('height', d => HEIGHT - yScale(d[1]));
    // .attr('fill', 'tomato')

    // Create a labels for x-axis
    svg
      .append('text')
      .attr('x', WIDTH / 2)
      .attr('y', 0)
      .style('font-size', 40)
      .style('font-family', 'verdana')
      .style('color', 'indigo')
      .attr('text-anchor', 'middle')
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
