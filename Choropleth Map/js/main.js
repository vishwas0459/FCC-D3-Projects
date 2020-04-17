const URL_EDU =
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';

const URL_COUNTY =
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

const margin = { top: 20, left: 20, right: 20, bottom: 20 };
const w = 1000 - margin.left - margin.right;
const h = 800 - margin.top - margin.bottom;
// Attach SVGs
const choropleth = d3
  .select('#choropleth')
  .append('svg')
  .attr('width', w + margin.left + margin.right)
  .attr('height', h + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Attach legendSVG
const legendSVG = choropleth
  .append('g')
  .attr('id', 'legend')
  .attr('transform', `translate(${w - 350},15)`)
  .append('rect')
  .attr('width', 250)
  .attr('height', 40)
  .append('text')
  .text('Legend will be added')
  .style('color', 'white');

const tooltip = d3
  .select('body')
  .append('div')
  .attr('id', 'tooltip')
  .attr('width', 'auto')
  .attr('height', 'auto')
  .style('display', 'none');

const mouseover = d => {
  console.log(dataset[d.id]);
  tooltip
    .attr('data-education', dataset[d.id].bachelorsOrHigher)
    .style('display', 'block')
    .html(
      `<span>${dataset[d.id].area_name}</span><br/><span>${
        dataset[d.id].bachelorsOrHigher
      }</span>`
    )
    .style('left', `${d3.event.clientX + 15}px`)
    .style('top', `${d3.event.clientY + 2}px`);
};
const mouseleave = d => {
  tooltip.style('display', 'none');
};

// choropleth map needs projections if we dont have topojson file
// const c_projection = d3.geoAlbers().scale().rotate();

const c_geoPath = d3.geoPath();
// .projection(c_projection);
const dataset = {};

// laod the data
Promise.all([d3.json(URL_EDU), d3.json(URL_COUNTY)])
  .then(([edu_Data, county_Data]) => {
    const topoData = topojson.feature(county_Data, county_Data.objects.counties)
      .features;
    topoData.forEach((d, i) => {
      dataset[d.id] = {
        id: d.id,
        fips: edu_Data[i].fips,
        bachelorsOrHigher: edu_Data[i].bachelorsOrHigher,
        area_name: edu_Data[i].area_name,
      };
    });
    // console.log('dataset', dataset);

    const colors = d3
      .scaleOrdinal()
      .domain([
        d3.min(dataset, d => d.bachelorsOrHigher),
        d3.max(dataset, d => d.bachelorsOrHigher),
      ])
      .range(['#FFA1A1', '#FF8181', '#FE6262', '#FE4242']); // colors shades

    choropleth
      .selectAll('paths')
      .data(
        topojson.feature(county_Data, county_Data.objects.counties).features
        // it gives the array after mapping topojson data
      )
      .enter()
      .append('path')
      .attr('d', c_geoPath)
      .attr('class', 'county')
      .attr('data-fips', (d, i) => edu_Data[i].fips)
      .attr('data-education', (d, i) => edu_Data[i].bachelorsOrHigher)
      .attr('fill', (d, i) => colors(edu_Data[i].bachelorsOrHigher))
      .on('mouseover', mouseover)
      .on('mouseleave', mouseleave);
  })
  .catch(err => console.log(err));
