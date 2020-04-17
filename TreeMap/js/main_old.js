// 'use strict';
const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const w = 800 - margin.left - margin.right;
const h = 800 - margin.top - margin.bottom;

// console.log('d3.layout', d3.layout());
// const WIDTH = 700;
// const HEIGHT = 500;

const URL =
  // `https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json`;
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';
// `https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json`;
let dataset = [];

// ATTACH SVG CANVAS
const svg = d3
  .select('#treemap')
  .append('svg')
  .attr('width', w)
  .attr('height', h)
  .append('g');
// .attr('transform', `translate(${margin.left},${margin.top})`);
// .attr('viewBox', (0, 0, w, h));

// label
svg
  .append('text')
  .attr('x', w / 2 - 20)
  .attr('y', margin.top / 2 + 10)
  .style('font-size', 30)
  .style('font-family', 'verdana')
  .style('color', 'indigo')
  .attr('text-anchor', 'middle')
  .attr('id', 'title')
  .text('Tree Map');

svg
  .append('text')
  .attr('x', w / 2)
  .attr('y', 90)
  .style('font-size', 20)
  .style('font-family', 'verdana')
  .style('color', 'indigo')
  .attr('text-anchor', 'middle')
  .attr('id', 'description')
  .text('Top 100 Most Sold Video Games Grouped by Platform');

// svg
//   .append('div')
//   .attr('width', w)
//   .attr('height', 200)
//   .attr('id', 'legends')
//   .style('border', '1px solod red');

const format = d3.format(',d');
const tooltip = d3
  .select('body')
  .append('div')
  .attr('id', 'tooltip')
  .attr('width', 'auto')
  .attr('height', 'auto');
//  Handle mouse events
const mouseover = d => {
  // console.log('d3.event.clientX', d3.event.clientX);
  // console.log('d3.event.clientY', d3.event.clientY);

  // console.log('d3.event.clientY', d3.event.clientY);

  tooltip
    .attr('data-value', d.data.value)
    .style('display', 'inline-block')
    .html(
      `<span>${d.data.name}</span>
      </br>
    <span>${d.data.category}</span>
    </br>
    <span>${d.data.value}</span>
    `
    )
    .style('left', `${d3.event.clientX - 5}px`)
    .style('top', `${d3.event.clientY - 5}px`);
};
const mouseleave = d => {
  tooltip.style('display', 'none');
};

const treemap = data =>
  d3.treemap().size([w, h]).tile(d3.treemapBinary).round(true).padding(1)(
    d3.hierarchy(data).sum(d => d.value)
  );

//LOAD DATA
d3.json(URL)
  .then(data => {
    let dataset = data;
    const root = treemap(data); // create a root node
    const myTile = svg
      .selectAll('g')
      .data(root.leaves())
      .join('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    const colors = d3.scaleOrdinal().domain(data).range(d3.schemeSet2);
    // append react for each node
    myTile
      .append('rect')
      .attr('class', 'tile')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .on('mouseover', mouseover)
      .on('mouseleave', mouseleave)
      .attr('fill', d => {
        while (d.depth > 1) d = d.parent;
        return colors(d.data.name);
      })
      .attr('data-name', d => d.data.name)
      .attr('data-category', d => d.data.category)
      .attr('data-value', d => d.data.value)
      .attr('fill-opacity', 0.6);
    myTile
      .append('text')
      .attr('id', 'vis')
      .selectAll('tspan')
      .data(
        d => d.data.name.split(/(?=[A-Z][a-z])|\s+/g).concat(format(d.value))
        // d.data.name.split(/([0-9])\s+/g).concat(format(d.value))
      )
      .join('tspan')
      .attr('x', 4)
      .attr(
        'dy',
        (d, i, nodes) =>
          `${(i === nodes.length - 100) * 0.3 + 1.1 + i * 0.07}rem`
      )
      .attr('fill-opacity', (d, i, nodes) =>
        i === nodes.length - 1 ? 0.7 : null
      )
      .attr('font-size', '10px')
      .text(d => {
        // console.log(d);
        return d;
      });

    const { children } = dataset;
    let keys = [];

    keys = children.map(child => child.name);
    console.log(keys);

    const legend = d3
      .select('#legend')
      .append('svg')
      .attr('width', w)
      .attr('height', h / 8)
      .attr('id', 'legend')
      .attr('transform', `translate(${margin.left}, ${0})`);

    keys.forEach((key, i) => {
      let legendRow = legend.append('g');

      legendRow
        .append('rect')
        .attr('class', 'legend-item')
        .attr('width', 10)
        .attr('height', 10)
        .attr('x', 0)
        .attr('y', i * 20)
        .attr('fill', colors(key));

      legendRow
        .append('text')
        .attr('x', 20)
        .attr('y', i * 20 + 10)
        .attr('text-anchor', 'start')
        .text(key);
    });
  })
  .catch(err => console.log(err));
