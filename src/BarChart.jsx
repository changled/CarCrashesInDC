import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { CONST } from './helper';

const propTypes = {
	data: PropTypes.array.isRequired,
	selectedID: PropTypes.string,
	onMouseOver: PropTypes.func.isRequired,
}

const defaultPropTypes = {
	selectedID: null,
}

class BarChart extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			scales: null,
			svgDimensions: {
				width: window.innerWidth,
				height: props.data.length * 13
			},
		}
	}

	componentDidMount() {
		this.drawChart();
	}

	componentDidUpdate(prevProps) {
		if (prevProps === this.props) {
			return;
		}

		this.drawChart();
	}

	/**
	 * Scale and draw the X and Y axes data of the chart
	 */
	drawChart() {
	   // Since the counties are already sorted highest to lowest by crashCount,
	   // we only need to look at the first index to know the highest crashCount
	   const maxCrashCount = this.props.data[0].crashCount || 0;

	   // The complete dimensions of the entire svg
	   const svgDimensions = {
	   	width: window.innerWidth,
	   	height: this.props.data.length * 13
	   };

	   // The size of just the chart without labels/margins
	   const width = svgDimensions.width - CONST.CHART.margins.left - CONST.CHART.margins.right;
		const height = svgDimensions.height - CONST.CHART.margins.top - CONST.CHART.margins.bottom;

   	// Configure the x-axis
	   const xScale = d3.scaleLinear()
	   	.range([0, width])
	   	.domain([0, maxCrashCount]);

		// Configure the y-axis
		const yScale = d3.scaleBand()
		   .range([height, 0])
		   .domain(this.props.data.map(data => data.name))
		   .padding(0.2);

		// Save the new dimensions and scales, which we'll use to render the chart
	   this.setState({
	   	svgDimensions,
	   	scales: { xScale, yScale }
	   });

	   // Scale and draw the x-axis
	   const xAxis = d3.axisBottom(xScale);
		d3.select(this.xAxisElement).call(xAxis);

		// Scale and draw the y-axis
	  	const yAxis = d3.axisLeft(yScale);
		d3.select(this.yAxisElement).call(yAxis);
	}

	render() {
		const { left, top, bottom } = CONST.CHART.margins;
		const axesTransform = `translate(${left}, ${top})`;
		const xAxisTransform = `translate(0, ${this.state.svgDimensions.height - top - bottom})`;
		const barsTransform = `translate(${left}, ${top})`;

		return (
			<svg id="barChartSvg" width={this.state.svgDimensions.width} height={this.state.svgDimensions.height}>
				<g id="axes" transform={axesTransform}>
					<g
						ref={element => { this.xAxisElement = element; }}
						transform={xAxisTransform}
					/>
					<g ref={element => { this.yAxisElement = element; }} />
				</g>
				{this.state.scales && (
					<g id="bars" transform={barsTransform}>
						{this.props.data.map((data, index) => {
							// Hacky way to cast to string for prop type matching
							const id = `${data.id}`;

							return (
								<rect
									className={this.props.selectedID === id ? 'selected' : ''}
									key={id}
									data={data}
									x={0}
									y={this.state.scales.yScale(data.name)}
									height={this.state.scales.yScale.bandwidth()}
									width={this.state.scales.xScale(data.crashCount)}
									onMouseOver={() => this.props.onMouseOver(id)}
								/>
							);
						})}
					</g>
				)}
			</svg>
		);
	}
}

BarChart.propTypes = propTypes;
BarChart.defaultPropTypes = defaultPropTypes;

export default BarChart;