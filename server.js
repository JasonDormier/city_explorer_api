'use strict';
/* ----------------- creating the server ----------------- */
const express = require('express');
const cors = require('cors');

require('dotenv').config();

/* ----------------- Setup Application Server ----------------- */

const app = express();
app.use(cors());

/* ----------------- Global Varibles ----------------- */
const PORT = process.env.PORT || 3111;

/* ----------------- Routes ----------------- */


app.get('/', (req, res) => {
  res.send('you made it home. here is change');
});

app.get('/location', (req, res) => {
  if (req.query.city === '') {
    res.status(500).send('No Data My Bad.');
    return;
  }
  const locationData = require('./data/location.json');
  const locationDataJson = locationData[0];
  console.log('req.query', req.query);

  const searchLocation = req.query.city;

  const newLocation = new Location(
    searchLocation,
    locationDataJson.display_name,
    locationDataJson.lat,
    locationDataJson.lon
  );
  res.send(newLocation);
});

app.get('/weather', (req, res) => {
  const weatherData = require('./data/weather.json');
  const weatherArr = [];
  weatherData.replaceMe.forEach(jsonObj => {
    const weather = new Weather(jsonObj);
    weatherArr.push(weather);
  });
  res.send(weatherArr);
});

/* ----------------- Helper Functions ----------------- */

function Location(search_query, formatted_query, latitude, longitude) {
  this.search_query = search_query;
  this.formatted_query = formatted_query;
  this.longitude = longitude;
  this.latitude = latitude;
}

function Weather(weatherJsonObj) {
  this.forecast_query = weatherJsonObj.forecast_query;
  this.time_query = weatherJsonObj.jstime_query;
}


/* ----------------- Start the server ----------------- */

app.listen(PORT, () => console.log(`we are up and running on ${PORT}`));
