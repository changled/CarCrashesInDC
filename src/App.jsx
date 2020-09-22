import React from 'react';
import Map from './Map.jsx';
import BarChart from './BarChart.jsx';
import { CONST, getCounties, configureMapProjection, filterCounties } from './helper';

class App extends React.Component {
   constructor(props) {
      super(props);

      this.state = {
         selectedYears: CONST.YEARS,
         visualization: CONST.MAP.id,
         selectedCounty: null,
         countiesWithCrashes: null,
      };

      this.counties = getCounties();
      this.geoGenerator = configureMapProjection(this.counties);

      // Bind private methods
      this.selectFilter = this.selectFilter.bind(this);
      this.selectCounty = this.selectCounty.bind(this);
   }

   componentDidMount() {
      this.getFilterCounties();
   }

   /**
    * Get all counties with at least one crash in the selected years
    */
   getFilterCounties() {
      const countiesWithCrashes = filterCounties(this.counties, this.state.selectedYears);

      this.setState({ countiesWithCrashes });
   }

   /**
    * @param {Number} selectedCounty The county ID
    */
   selectCounty(selectedCounty) {
      this.setState({ selectedCounty });
   }

   /**
    * Select the visualization type and clear the currently selected county
    *
    * @param {SyntheticEvent} event
    * @param {String} visualization The type of visualization, either 'map' or 'barChart'
    */
   selectVisualization(event, visualization) {
      event.preventDefault();

      this.setState({
         visualization,
         selectedCounty: null,
      });
   }

   /**
    * Select or unselect a year from the filters
    *
    * @param {SyntheticEvent} event
    * @param {String} year
    */
   selectFilter(event, year) {
      event.preventDefault();

      this.setState((prevState) => {
         // If the year not already selected, add it to the selected
         // years list; otherwise, remove it from the list
         const indexInArr = this.state.selectedYears.indexOf(year);
         const selectedYears = indexInArr < 0
            ? [...prevState.selectedYears, year]
            : [...prevState.selectedYears.slice(0, indexInArr), ...prevState.selectedYears.slice(indexInArr + 1)];

         return { selectedYears };
      }, this.getFilterCounties);
   }

   render() {
      const mapIsSelected = this.state.visualization === CONST.MAP.id;

      const selectedCounty = this.state.selectedCounty !== null
         ? `${this.counties[this.state.selectedCounty].properties.name} County`
         : null;

      return (
         <div className="App">
            <div className="header w-100 h-100">
               <h3>Car Crashes in Washington DC</h3>
               <div>By Neighborhood, from 2010 - 2014</div>
            </div>
            <div>
               <div className="btn-group-vertical position-absolute inputButtons right-0">
                  <div className="btn-group">
                     <button
                        type="button"
                        className={`btn ${mapIsSelected ? 'btn-info' : 'btn-outline-info'}`}
                        onClick={e => this.selectVisualization(e, 'map')}
                     >
                        Map View
                     </button>
                     <button
                        type="button"
                        className={`btn ${mapIsSelected ? 'btn-outline-info' : 'btn-info'}`}
                        onClick={e => this.selectVisualization(e, 'barChart')}
                     >
                        Bar Chart View
                     </button>
                  </div>
                  <div className="btn-group">
                     {CONST.YEARS.map(year => {
                        return (
                           <button
                              key={year}
                              type="button"
                              className={`btn ${this.state.selectedYears.includes(year) ? 'btn-info' : 'btn-outline-info'}`}
                              onClick={e => this.selectFilter(e, year)}
                           >
                              {year}
                           </button>
                        );
                     })}
                  </div>
                  {mapIsSelected && (
                     <div className="countyDropdown w-100">
                        <button
                           className="btn btn-info dropdown-toggle float-right w-100"
                           type="button"
                           id="countySelectDropdown"
                           data-toggle="dropdown"
                        >
                           {selectedCounty || CONST.dropdownText}
                        </button>
                        <div className="dropdown-menu dropdown-menu-right w-100">
                           {this.counties && Object.keys(this.counties).map(key => (
                              <a
                                 href="/#"
                                 key={key}
                                 className="dropdown-item"
                                 onClick={(e) => { e.preventDefault(); this.selectCounty(key, false); }}
                              >
                                 {this.counties[key].properties.name}
                              </a>
                           ))}
                        </div>
                     </div>
                  )}
                  <div className="right-0 m-3 w-100">
                     <div className="mb-3 font-weight-bold">
                        {selectedCounty || (mapIsSelected ? CONST.MAP.prompt : CONST.CHART.prompt)}
                     </div>
                     {this.state.selectedCounty && CONST.YEARS.map(year => {
                        const isSelected = this.state.selectedYears.includes(year);
                        const crashCount = this.counties[this.state.selectedCounty].properties[year];
                        return <div key={year}>{isSelected ? `Crashes in ${year}: ${crashCount || 0}` : ''}</div>;
                     })}
                  </div>
               </div>
               {mapIsSelected && (
                  <div className="position-relative">
                     {this.counties && (
                        <Map
                           data={this.counties}
                           selectedID={this.state.selectedCounty}
                           geoGenerator={this.geoGenerator}
                           onMouseOver={this.selectCounty}
                        />
                     )}
                  </div>
               )}
               {!mapIsSelected && (
                  <div>
                     {this.state.countiesWithCrashes && this.state.countiesWithCrashes.length > 0 && (
                        <BarChart
                           data={this.state.countiesWithCrashes}
                           selectedID={this.state.selectedCounty}
                           onMouseOver={this.selectCounty}
                        />
                     )}
                  </div>
               )}
            </div>
         </div>
      );
   }
}

export default App;
