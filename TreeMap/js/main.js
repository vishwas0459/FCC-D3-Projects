const URL =
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';

// const margin = { top: 20, left: 20, right: 20, bottom: 20 };
const w = 960;
const h = 570;

// Attach SVGs
const treemapSVG = d3
  .select('#treemap')
  .append('svg')
  .attr('width', w)
  .attr('height', h);

const legendSVG = d3
  .select('#legend')
  .append('svg')
  .attr('width', w)
  .attr('height', 200);

// tooltip
const tooltip = d3
  .select('body')
  .append('div')
  .attr('id', 'tooltip')
  .attr('width', 'auto')
  .attr('height', 'auto')
  .attr('display', 'none');

const mouseover = d => {
  tooltip
    .attr('data-value', d.data.value)
    .style('display', 'block')
    .html(
      `<span>${d.data.name}</span>
          </br>
        <span>Category: ${d.data.category}</span>
        </br>
        <span>Value: ${d.data.value}</span>
        `
    )
    .style('left', `${d.x0 + 5}px`)
    .style('top', `${d.y1}px`);
};
const mouseleave = d => {
  tooltip.style('display', 'none');
};
// load the data
let dataset = [];

d3.json(URL)
  .then(data => {
    dataset = data;

    // create the treemap
    const rootNode = d3
      .treemap()
      .size([w, h])
      .tile(d3.treemapBinary)
      .round(true)
      .padding(1)(d3.hierarchy(data).sum(d => d.value));

    // create color scheme
    const colors = d3.scaleOrdinal(d3.schemeCategory10);

    // create tile
    const myTitle = treemapSVG
      .selectAll('rect')
      .data(rootNode.leaves())
      .enter()
      .append('rect')
      .attr('class', 'tile')
      .on('mouseover', mouseover)
      .on('mouseleave', mouseleave)
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => {
        while (d.depth > 1) d = d.parent;
        return colors(d.data.name);
      })
      .attr('data-name', d => d.data.name)
      .attr('data-category', d => d.data.category)
      .attr('data-value', d => d.data.value)
      .attr('fill-opacity', 0.6);

    // working
    treemapSVG
      .selectAll('values')
      .data(rootNode.leaves())
      .enter()
      .append('text')
      .selectAll('tspan')
      .data(d =>
        d.data.name.split(/(?=[A-Z][^A-Z])/g).map(name => {
          return {
            text: name,
            x0: d.x0,
            y0: d.y0,
            x1: d.x1,
            y1: d.y1,
          };
        })
      )
      .enter()
      .append('tspan')
      .attr('class', 'tspan')
      .attr('x', d => d.x0 + 2)
      .attr('y', (d, i) => Math.round(d.y0 + 10 + i * 10))
      .text(d => d.text)
      .attr('font-size', '0.5em');

    const { children } = dataset;
    let keys = [];

    keys = children.map(child => child.name);

    keys.forEach((key, i) => {
      let legendRow = legendSVG
        .append('g')
        .attr('transform', 'translate(0,15)');

      legendRow
        .append('rect')
        .attr('class', 'legend-item')
        .attr('width', 10)
        .attr('height', 25)
        .attr('x', 5)
        .attr('y', i * 20)
        .attr('fill', colors(key));

      legendRow
        .append('text')
        .attr('x', 22)
        .attr('y', i * 20 + 15)
        .attr('text-anchor', 'start')
        .text(key);
    });
  })
  .catch(err => console.log(err));
