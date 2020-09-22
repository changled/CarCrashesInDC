import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
	data: PropTypes.object.isRequired,
	selectedID: PropTypes.string,
	geoGenerator: PropTypes.func.isRequired,
	onMouseOver: PropTypes.func.isRequired,
}

const defaultPropTypes = {
	selectedID: null,
}

function Map(props) {
	const { data, selectedID, geoGenerator, onMouseOver } = props;

	return (
      <svg width="600px" height="600px">
         <g className="map">
            {data && Object.keys(data).map(key => (
               <path
                  key={key}
                  d={geoGenerator(data[key])}
                  className={(selectedID || null) === key ? 'selected' : ''}
                  onMouseOver={() => onMouseOver(key)}
               />
            ))}
         </g>
      </svg>
	);
}

Map.propTypes = propTypes;
Map.defaultPropTypes = defaultPropTypes;

export default Map;