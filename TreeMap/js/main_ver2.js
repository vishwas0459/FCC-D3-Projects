const margin = { top: 20, left: 20, right: 20, bottom: 20 };

// d3 margin convention
// const w = 1000 - margin.left - margin.right;
// const h = 610 - margin.top - margin.bottom;

const w = 860;
const h = 570;

const URL =
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';

// attach the svg to body element

const svg = d3
  .select('#treemap')
  .append('svg')
  .attr('width', w)
  .attr('height', h)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Heading
// svg
//   .append('text')
//   .attr('x', w / 2)
//   .attr('y', 50)
//   .style('font-size', 30)
//   .style('font-family', 'verdana')
//   .style('color', 'indigo')
//   .attr('text-anchor', 'middle')
//   .attr('id', 'title')
//   .text('Tree Map');

// Description
// svg
//   .append('text')
//   .attr('x', w / 2)
//   .attr('y', 90)
//   .style('font-size', 20)
//   .style('font-family', 'verdana')
//   .style('color', 'indigo')
//   .attr('text-anchor', 'middle')
//   .attr('id', 'description')
//   .text('Top 100 Most Sold Video Games Grouped by Platform');

const format = d3.format(',d');
const tooltip = d3
  .select('body')
  .append('div')
  .attr('id', 'tooltip')
  .attr('width', 'auto')
  .attr('height', 'auto');

const mouseover = d => {
  console.log(d);
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
    .style('left', `${d.x1}px`)
    .style('top', `${d.y0 + 100}px`);
};
const mouseleave = d => {
  tooltip.style('display', 'none');
};

let dataset = null;
// load the data
d3.json(URL).then(data => {
  dataset = data;
  const rootNode = d3
    .treemap()
    .size([w, h])
    .tile(d3.treemapBinary)
    // .round(true)
    .padding(1)(d3.hierarchy(data).sum(d => d.value));

  const colors = d3.scaleOrdinal().domain(data).range(d3.schemeSet2);

  const myTile = svg
    .selectAll('rect')
    .data(rootNode.leaves())
    .enter()
    .append('rect')
    .attr('class', 'tile')
    .attr('x', d => d.x0)
    // .attr('y', d => d.y0 + 150)
    .attr('y', d => d.y0)

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

  // add the labels
  svg
    .selectAll('values')
    .data(rootNode.leaves())
    .enter()
    .append('text')
    .attr('x', d => d.x0 + 2)
    .attr('y', d => d.y0 + 20 + 150)
    .text(d => d.data.name)
    .attr('font-size', '5px');

  const { children } = dataset;
  let keys = [];

  keys = children.map(child => child.name);
  console.log(keys);

  const legend = d3
    .select('#legend')
    .append('svg')
    .attr('width', w / 2)
    .attr('height', h * 0.2);

  keys.forEach((key, i) => {
    let legendRow = legend.append('g');

    legendRow
      .append('rect')
      .attr('class', 'legend-item')
      .attr('width', 10)
      .attr('height', 10)
      .attr('x', 50)
      .attr('y', i * 20 + 10)
      .attr('fill', colors(key));

    legendRow
      .append('text')
      .attr('x', 70)
      .attr('y', i * 20 + 20)
      .attr('text-anchor', 'start')
      .text(key);
  });
});
