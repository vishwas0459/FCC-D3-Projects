const URL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';

const margin = { top: 50, left: 50, right: 50, bottom: 50 };
const w = 900;
const h = 550;
const colors = d3.scaleOrdinal(d3.schemeCategory10);

// Attach SVGs
const treemapSVG = d3.select('#treemap').append('svg').attr('width', w).attr('height', h);

const legendSVG = d3.select('#legend').append('svg').attr('width', w).attr('height', 50);

// tooltip
const tooltip = d3
  .select('body')
  .append('div')
  .attr('id', 'tooltip')
  .attr('width', 'auto')
  .attr('height', 'auto')
  .style('display', 'none');

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
    const rootNode = d3.treemap().size([w, h]).tile(d3.treemapBinary)(
      d3
        .hierarchy(data)
        .sum(d => d.value)
        .sort(function (a, b) {
          return b.value - a.value;
        })
    );

    // create color scheme
    treemapSVG
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
      .attr('fill-opacity', 0.8)
      .attr('stroke', 'white');

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
      // for text label on tile
      .append('tspan')
      .attr('class', 'tspan')
      .attr('x', d => d.x0 + 2)
      .attr('y', (d, i) => Math.round(d.y0 + 10 + i * 10))
      .text(d => d.text)
      .attr('font-size', '0.5em');

    let keys = dataset.children.map(child => child.name);

    keys.forEach((key, i) => {
      let legendRow = legendSVG.append('g');

      legendRow
        .append('rect')
        .attr('class', 'legend-item')
        .attr('width', 100)
        .attr('height', 20)
        .attr('x', i * 100)
        .attr('y', 0)
        .attr('fill', colors(key))
        .attr('opacity', 0.8);
      legendRow
        .append('text')
        .attr('x', i * 100 + 5)
        .attr('y', 40)
        .attr('text-anchor', 'start')
        .text(key);
    });
  })
  .catch(err => console.log(err));
