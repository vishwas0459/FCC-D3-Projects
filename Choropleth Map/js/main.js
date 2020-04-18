const URL_EDU =
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';

const URL_COUNTY =
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

const margin = { top: 20, left: 20, right: 20, bottom: 20 };
const w = 1000 - margin.left - margin.right;
const h = 800 - margin.top - margin.bottom;
// Attach SVGs
const choroplethSVG = d3
  .select('#choropleth')
  .append('svg')
  .attr('width', w + margin.left + margin.right)
  .attr('height', h + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

const tooltip = d3
  .select('body')
  .append('div')
  .attr('id', 'tooltip')
  .attr('width', 'auto')
  .attr('height', 'auto')
  .style('display', 'none');

const mouseover = d => {
  //   console.log(dataset[d.id]);
  tooltip
    .attr('data-education', dataset[d.id].bachelorsOrHigher)
    .style('display', 'block')
    .html(
      `<span>${dataset[d.id].area_name},${dataset[d.id].state} ${
        dataset[d.id].bachelorsOrHigher
      }%</span>`
    )
    .style('left', `${d3.event.clientX + 15}px`)
    .style('top', `${d3.event.clientY + 2}px`);
};
const mouseleave = d => {
  tooltip.style('display', 'none');
};

// choropleth map needs projections if we dont have topojson file
// const c_projection = d3.geoAlbers().scale().rotate();

const geoPath = d3.geoPath();
// .projection(c_projection);
const dataset = {};

// laod the data
Promise.all([d3.json(URL_EDU), d3.json(URL_COUNTY)])
  .then(([eduData, countyData]) => {
    const topoData = topojson.feature(countyData, countyData.objects.counties)
      .features;
    topoData.forEach((d, i) => {
      let index = eduData.findIndex(data => data.fips === d.id);
      // console.log(`topo_id:${d.id} ---- edu_index:${index}`);
      dataset[d.id] = {
        id: d.id,
        fips: eduData[index].fips,
        bachelorsOrHigher: eduData[index].bachelorsOrHigher,
        area_name: eduData[index].area_name,
        state: eduData[index].state,
      };
    });
    const colors = d3.scaleThreshold().domain([10, 20, 30, 40, 50, 60, 70]); // As US required min 4 colors so divided domain from min to max in 4
    colors.range(d3.schemeOranges[colors.domain().length]);
    choroplethSVG
      .selectAll('paths')
      .data(
        topojson.feature(countyData, countyData.objects.counties).features
        // it gives the array after mapping topojson data
      )
      .enter()
      .append('path')
      .attr('d', geoPath)
      .attr('class', 'county')
      .attr('data-fips', d => dataset[d.id].fips)
      .attr('data-education', d => dataset[d.id].bachelorsOrHigher)
      .attr('fill', d => colors(dataset[d.id].bachelorsOrHigher))
      // .attr('stroke', 'white')
      .on('mouseover', mouseover)
      .on('mouseleave', mouseleave);

    // To outline the states
    choroplethSVG
      .append('path')
      //Note:- https://stackoverflow.com/questions/13728402/what-is-the-difference-d3-datum-vs-data
      .datum(
        topojson.mesh(countyData, countyData.objects.states, (a, b) => a !== b)
      )
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-linejoin', 'round')
      .attr('d', geoPath);

    // Attach legendSVG
    const legendSVG = choroplethSVG
      .append('g')
      .attr('id', 'legend')
      .attr('transform', `translate(${w - 350},15)`);

    const width = 300;
    const length = colors.range().length;

    // create a linear scale
    const xScale = d3
      .scaleLinear()
      .domain([1, length - 1])
      .rangeRound([width / length, (width * (length - 1)) / length]);
    const xAxis = d3
      .axisBottom(xScale)
      .tickSize(13)
      .tickFormat(i => colors.domain()[i - 1])
      .tickValues(d3.range(1, length));

    legendSVG
      .selectAll('rects')
      .data(colors.range())
      .join('rect')
      .attr('height', 8)
      .attr('x', (d, i) => xScale(i))
      .attr('width', (d, i) => xScale(i + 1) - xScale(i))
      .attr('fill', d => d);

    legendSVG.call(xAxis).select('.domain').remove();
  })
  .catch(err => console.log(err));
