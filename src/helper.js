import geojson from './annotatedData.json';
import { geoMercator, geoPath } from 'd3-geo';

/**
 * The app constants
 */
const CONST = {
	YEARS: ['2010', '2011', '2012', '2013', '2014'],
	MAP: {
		id: 'map',
		prompt: 'Hover over the map...',
	},
	CHART: {
		id: 'barChart',
		prompt: 'Hover over the chart...',
		margins: {
			top: 0,
			right: 20,
			bottom: 30,
			left: 150
		}
	},
	dropdownText: 'Select a county...',
};

/**
 * Build an object of county data where each key is the county's ID
 * so we can get a specific county's data in constant time
 *
 * @return {Object}
 */
function getCounties() {
   const counties = geojson.features.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
   }, {});

   return counties;
}

/**
 * Get the projection function that will display the map centered around
 * and scaled to the given coordinates
 *
 * @param {Object} counties
 *
 * @return {Function}
 */
function configureMapProjection(counties) {
	let minLong = null;
   let maxLong = null;
   let minLat = null;
   let maxLat = null;

   // Find the maximum and minimum coordinate values
   Object.keys(counties).forEach(id => {
      counties[id].geometry.coordinates.forEach(coordinates => {
         coordinates.forEach(coord => {
            if (minLat === null || coord[1] < minLat) {
               minLat = coord[0];
            }
            if (maxLat === null || coord[1] > maxLat) {
               maxLat = coord[0];
            }
            if (minLong === null || coord[0] < minLong) {
               minLong = coord[1];
            }
            if (maxLong === null || coord[0] > maxLong) {
               maxLong = coord[1];
            }
         });
      });
   });

   // Calculate the center coordinates
   const centerLat = Math.round((minLat + maxLat) / 2);
   const centerLong = Math.round((minLong + maxLong) / 2);

   // Convert spherical polygonal geometry to planar
   const projection = geoMercator()
      .scale(130000)
      .center([centerLat, centerLong])
      .translate([300, 0]);

   // Configure the projection type
   return geoPath().projection(projection);
}

/**
 * Filters the counties by the specified years (only returns counties
 * with at least one crash)
 *
 * @param {Object} counties
 * @param {Array} selectedYears A list of years we want results from
 *
 * @return {Array}
 */
function filterCounties(counties, selectedYears) {
	let countiesWithCrashes = [];

	Object.keys(counties).forEach(currID => {
         const countyData = counties[currID].properties;

         // Only count the crashes from the filtered years
         const crashCount = selectedYears.reduce((acc, year) => acc + (countyData[year] || 0), 0);

         // Return early if the count is 0
         if (crashCount <= 0) {
            return;
         }

         countiesWithCrashes.push({
            crashCount,
            id: parseInt(currID),
            name: counties[currID].properties.name,
         });
      });

      // Sort by highest crash count to lowest
      countiesWithCrashes.sort((a, b) => b.crashCount - a.crashCount);

      return countiesWithCrashes;
}

export {
	CONST,
	getCounties,
	configureMapProjection,
	filterCounties,
};