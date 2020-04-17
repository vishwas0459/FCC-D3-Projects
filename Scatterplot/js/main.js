// 'use strict';
const margin = { top: 50, right: 50, bottom: 50, left: 70 };
const WIDTH = 700 - margin.left - margin.right;
const HEIGHT = 500 - margin.top - margin.bottom;

const timeFormateSpecific = '%M:%S';

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
  .style('font-size', 30)
  .style('font-family', 'verdana')
  .style('color', 'indigo')
  .attr('text-anchor', 'middle')
  .attr('id', 'title')
  .text('Doping of Bicycle Athelets');

// ToolTip
const tooltip = d3
  .select('body')
  .append('div')
  .attr('id', 'tooltip')
  .attr('width', 'auto')
  .attr('height', 'auto');
// .style('display', 'none');
// .attr('fill', 'green');

const xScale = d3
  .scaleLinear()
  // .domain([d3.min(dataset, d => d.Year), d3.max(dataset, d => d.Year)])
  .range([0, WIDTH]);

const yScale = d3.scaleTime().range([0, HEIGHT]);
//  Handle mouse events
const mouseover = d => {
  console.log('d3.event.clientX', d3.event.clientX);
  console.log('d3.event.clientY', d3.event.clientY);
  // console.log('xScaleValue', xScale(d.Year));
  // console.log('YScaleValue', yScale(d3.timeParse(timeFormateSpecific)(d.Time)));
  // console.log(
  //   HEIGHT - Math.round(yScale(d3.timeParse(timeFormateSpecific)(d.Time)))
  // );

  tooltip
    .attr('data-year', d.Year)
    .style('display', 'inline-block')
    .html(
      `<span>${d.Name} : ${d.Nationality}</span>
      </br>
    <span>${d.Year} : ${d.Time}</span>
    </br>
    <span>${d.Doping}</span>
    `
    )
    .style('left', `${d3.event.clientX + 10}px`)
    .style('top', `${d3.event.clientY + 10}px`);
  // .style('left', `${Math.round(xScale(d.Year) + 10)}px`)
  // .attr(
  //   'transform',
  //   `translate(0,${yScale(d3.timeParse(timeFormateSpecific)(d.Time))}`
  // );
  // .style(
  //   'top',
  //   `${
  //     HEIGHT - Math.round(yScale(d3.timeParse(timeFormateSpecific)(d.Time)))
  //   }px`
  // );
};
const mouseleave = d => {
  tooltip.style('display', 'none');
};
//LOAD DATA
d3.json(URL)
  .then(data => {
    dataset = data;

    let dopingData = {
      'Doping Allegation': 0,
      'No Doping Allegation': 0,
    };

    dataset.forEach(d => {
      d.Doping === ''
        ? dopingData['Doping Allegation']++
        : dopingData['No Doping Allegation']++;
    });

    // create a lengend
    let keys = Object.keys(dopingData);
    // console.log({ dopingData });
    // let color = d3.scaleOrdinal().domain(keys).range(['red', 'black']);
    const colorScale = d3
      .scaleOrdinal()
      .domain([...keys])
      .range(['red', 'black']);

    // create svg to show legend
    const legend = svg
      .append('g')
      .attr('id', 'legend')
      .attr('transform', `translate(${WIDTH - 150}, ${HEIGHT - 150})`);

    keys.forEach((key, i) => {
      let legendRow = legend.append('g');

      legendRow
        .append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('x', 0)
        .attr('y', i * 20)
        .attr('fill', colorScale(key));

      legendRow
        .append('text')
        .attr('x', 20)
        .attr('y', i * 20 + 10)
        .attr('text-anchor', 'start')
        .text(key);
    });
    // .selectAll('rect')
    // .data(keys)
    // .enter();
    // .append('text')
    // .attr('id', 'desc')
    // .text(d => d);

    const circles = svg.selectAll('circle').data(dataset);

    // GENERATE SCALE & AXES -x
    // const xScale = d3
    //   .scaleLinear()
    xScale.domain([d3.min(dataset, d => d.Year), d3.max(dataset, d => d.Year)]);
    // .range([0, WIDTH]);

    // verify xScale
    // console.log('nn', xScale(dataset[0].Year));

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
    // .tickPadding();

    svg
      .append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${HEIGHT})`)
      .call(xAxis);

    // GENERATE SCALE & AXES -Y
    // need to format the Time
    const timeDataset = dataset.map(d =>
      d3.timeParse(timeFormateSpecific)(d.Time)
    );
    // const yScale = d3
    //   .scaleTime()
    //   .range([0, HEIGHT])
    yScale.domain(d3.extent(timeDataset));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));

    svg.append('g').attr('id', 'y-axis').call(yAxis);

    // DISPLAY ON SCREEN
    circles
      .enter()
      .append('circle')
      .on('mousemove', mouseover)
      .on('mouseleave', mouseleave)
      .attr('class', 'dot')
      .attr('r', 5)
      .attr('cx', d => xScale(d.Year))
      .attr('cy', d => yScale(d3.timeParse(timeFormateSpecific)(d.Time)))
      .attr('data-xvalue', d => d.Year)
      .attr(
        'data-yvalue',
        d => new Date(d3.timeParse('%Y,%M:%S')(`${d.Year},${d.Time}`))
      )
      // .attr('fill', 'red');
      //  add mouse event listeners
      .attr('fill', d => colorScale(d.Doping));

    svg
      .append('text')
      .attr('x', -(HEIGHT / 2) + margin.top)
      .attr('y', -45)
      .style('font-size', 15)
      .style('font-family', 'verdana')
      .attr('text-anchor', 'middle')
      .text('Time in Minutes')
      .attr('transform', `rotate(-90)`);
  })
  .catch(err => console.log(err));
