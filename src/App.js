import React, { useState, useEffect } from 'react';

import { FormControl, Select, MenuItem, Card, CardContent, CircularProgress } from "@material-ui/core"

import './App.css';
import InfoBox from './components/InfoBox';
import Map from './components/Map';
import Table from './components/Table';
import { sortData } from './util';
import LineGraph from './components/LineGraph';
import "leaflet/dist/leaflet.css"

function App() {
  const stats = [
    { value: "cases", title: "Cases" },
    { value: "recovered", title: "Recovered" },
    { value: "deaths", title: "Deaths" }
  ]
  const [countries, setCountries] = useState([])
  const [mapCountries, setMapCountries] = useState([])
  const [tableData, setTableData] = useState([])
  const [selectedCountry, setSelectedCountry] = useState("worldwide")
  const [selectedStats, setSelectedStats] = useState("cases")
  const [countryData, setCountryData] = useState([])
  const [dataLoading, setDataLoading] = useState(false)
  const [mapCenter, setMapCenter] = useState({ lat: 38.9637, lng: 35.2433 })
  const [mapZoom, setMapZoom] = useState(3)

  useEffect(() => {
    const getAllData = async () => {
      await fetch("https://disease.sh/v3/covid-19/all")
        .then((response) => response.json())
        .then((data) => {
          setCountryData(data)
          setDataLoading(true)
        });
    };

    getAllData();
  }, [])

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({ name: country.country, value: country.countryInfo.iso2, }));
          setCountries(countries)
          setMapCountries(data)
          const sortedData = sortData(data)
          setTableData(sortedData)
        });
    }

    getCountriesData();
  }, [])

  const onStatsChange = (event) => {
    setSelectedStats(event.target.value)
  }

  const onCountryChange = async (event) => {
    setDataLoading(false)
    const countryCode = event.target.value;

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const [lat, long] = countryCode === "worldwide" ? [38.9637, 35.2433] : [data.countryInfo.lat, data.countryInfo.long];
        countryCode === "worldwide" ?? setMapZoom(3);
        setSelectedCountry(countryCode)
        setCountryData(data)
        setDataLoading(true)
        setMapCenter({ lat: lat, lng: long })
        setMapZoom(4)
      });
  }

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1 className="app__title">Covid-19 Tracker</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={selectedCountry}
              onChange={onCountryChange}>
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {
                countries.map((country, index) => (
                  <MenuItem
                    key={index}
                    value={country.value}>
                    {country.name}
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          {dataLoading ? (
            <div className="app__stats--box">
              <InfoBox
                isRed
                title="Corona Virus Cases"
                cases={countryData.todayCases}
                total={countryData.cases}
                active={selectedStats === "cases"}
                onClick={e => setSelectedStats("cases")}
              />
              <InfoBox
                title="Corona Virus Recovered"
                cases={countryData.todayRecovered}
                total={countryData.recovered}
                active={selectedStats === "recovered"}
                onClick={e => setSelectedStats("recovered")} />
              <InfoBox
                isRed
                title="Corona Virus Deaths"
                cases={countryData.todayDeaths}
                total={countryData.deaths}
                active={selectedStats === "deaths"}
                onClick={e => setSelectedStats("deaths")} />
            </div>
          ) : (
              <div className="app__stats--progress">
                <CircularProgress color="secondary" disableShrink />
              </div>
            )}
        </div>

        {dataLoading ? (
          <Map
            center={mapCenter}
            zoom={mapZoom}
            countries={mapCountries}
            casesType={selectedStats}
          />
        ) : (
            <div className="app__stats--progress">
              <CircularProgress color="secondary" disableShrink />
            </div>
          )}


      </div>

      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
          <h3 className="app__right--secondTitle">Worldwide {selectedStats.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())))}</h3>
          <Select
            variant="outlined"
            fullWidth
            height="50%"
            value={selectedStats}
            onChange={onStatsChange}
            className="app__right--dropdown">
            {
              stats.map((stat, index) => (
                <MenuItem
                  key={index}
                  value={stat.value}>
                  {stat.title}
                </MenuItem>
              ))
            }
          </Select>
          <LineGraph casesType={selectedStats} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;