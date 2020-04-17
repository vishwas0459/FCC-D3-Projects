// 'use strict';
const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const WIDTH = 700 - margin.left - margin.right;
const HEIGHT = 500 - margin.top - margin.bottom;

const URL =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
let dataset = [];

// ATTACH SVG CANVAS
const svg = d3
  .select(document.getElementById('scatterplot'))
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
  .style('font-size', 40)
  .style('font-family', 'verdana')
  .style('color', 'indigo')
  .attr('text-anchor', 'middle')
  .attr('id', 'title')
  .text('Doping of Athelets');

//LOAD DATA
d3.json(URL)
  .then(data => {
    dataset = data;
    // dataset.forEach(data => console.log(data.Year));

    const circles = svg.selectAll('circle').data(dataset);
    const yearFormatSpecifier = '%Y';
    const yearDataset = dataset.map(d =>
      d3.timeParse(yearFormatSpecifier)(d.Year)
    );
    // console.log(yearDataset[0]);
    console.log('xxx', d3.timeFormat('%Y')(yearDataset[0]));

    // GENERATE SCALE & AXES -x
    const xScale = d3
      .scaleLinear()
      .domain(
        // d3.extent(yearDataset)
        [
          d3.min(dataset, d => d3.timeParse('%Y')(d.Year - 1)),
          d3.max(dataset, d => d3.timeParse('%Y')(d.Year - 1)),
        ]
      )
      .range([0, WIDTH]);

    // console.log(('yearDataset', d3.timeParse('%Y')(yearDataset[0])));
    // .padding(5);
    const xAxis = d3
      .axisBottom(xScale)
      // .tickFormat(yearDataset, d => d3.timeFormat(yearFormatSpecifier)(d));
      .tickFormat(d3.timeFormat('%Y'));

    // console.log('x', xScale(d3.timeParse(yearFormatSpecifier)('1994')));
    // .tickFormat((yearDataset, d => d3.timeFormat('%Y')(d)));
    // .tickFormat((timeDataset, d => d3.timeFormat(timeFormateSpecific)(d)));

    svg
      .append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${HEIGHT})`)
      .call(xAxis);

    // GENERATE SCALE & AXES -Y
    // need to format the Time
    const timeFormateSpecific = '%M:%S';
    const timeDataset = dataset.map(d =>
      d3.timeParse(timeFormateSpecific)(d.Time)
    );
    // console.log('timeDataset', timeDataset);
    const yScale = d3
      .scaleTime()
      .range([0, HEIGHT])
      .domain(d3.extent(timeDataset));
    // console.log(yScale(d3.timeParse(timeFormateSpecific)('37:50')));
    // we need to adjust the yScale tick
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));

    // .tickFormat((timeDataset, d => d3.timeFormat(timeFormateSpecific)(d)));
    svg.append('g').attr('id', 'y-axis').call(yAxis);

    // DISPLAY ON SCREEN
    circles
      .enter()
      .append('circle')
      .attr('class', 'dot')
      // .attr('data-xvalue',)
      // .attr('data-yvalue')
      .attr('r', 5)
      .attr('cx', d => xScale(d3.timeParse(yearFormatSpecifier)(d.Year)))
      .attr('cy', d => yScale(d3.timeParse(timeFormateSpecific)(d.Time)))
      .attr('data-xvalue', d =>
        d3.timeFormat('%Y')(d3.timeParse(yearFormatSpecifier)(`${d.Year}`))
      )

      // .attr('data-yvalue', d =>
      //   d3.timeFormat(timeFormateSpecific)(
      //     d3.timeParse(timeFormateSpecific)(`${d.Time}`)
      //   )
      // )
      .attr(
        'data-yvalue',
        d => new Date(d3.timeParse('%Y,%M:%S')(`${d.Year},${d.Time}`))
      )

      .attr('fill', 'red');
  })
  .catch(err => console.log(err));
