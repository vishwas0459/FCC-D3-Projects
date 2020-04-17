const URL_EDU =
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';

const URL_COUNTY =
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

const margin = { top: 20, left: 20, right: 20, bottom: 20 };
const w = 1000 - margin.left - margin.right;
const h = 800 - margin.top - margin.bottom;
const dataset = {};
// Attach SVGs
const choropleth = d3
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
  console.log('mouseover', dataset[d.id]);
  tooltip
    .attr('data-education', dataset[d.id].bachelorsOrHigher)
    .style('display', 'block')
    .html(`<span>${dataset[d.id].bachelorsOrHigher}</span>`)
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

// laod the data
Promise.all([d3.json(URL_EDU), d3.json(URL_COUNTY)])
  .then(([edu_Data, county_Data]) => {
    // console.log('edu_Data', edu_Data);
    console.log('county_Data', county_Data);
    // console.log('d3', d3.geo);

    const topoData = topojson.feature(county_Data, county_Data.objects.counties)
      .features;
    topoData.forEach((d, i) => {
      dataset[d.id] = {
        id: d.id,
        fips: edu_Data[i].fips,
        bachelorsOrHigher: edu_Data[i].bachelorsOrHigher,
      };
    });

    // console.log('dataset', dataset);

    const colors = d3.scaleOrdinal(d3.schemeCategory10);
    //   .domain([d3.min(dataset, d => d), d3.max(dataset, d => d)]);
    console.log(
      'topojson.feature(county_Data, county_Data.objects.counties).features',
      topojson.feature(county_Data, county_Data.objects.counties).features
    );
    choropleth
      .selectAll('paths')
      .data(
        topojson.feature(county_Data, county_Data.objects.counties).features
      )
      .enter()
      .append('path')
      .attr('d', c_geoPath)
      .attr('class', 'county')
      .attr('data-fips', (d, i) => edu_Data[i].fips)
      .attr('data-education', (d, i) => edu_Data[i].bachelorsOrHigher)
      .attr('fill', d => colors(d.id))
      .on('mouseover', mouseover)
      .on('mouseleave', mouseleave);

    //   .attr('fill', 'green');

    //   .style('stroke', 'black');
  })
  .catch(err => console.log(err));
