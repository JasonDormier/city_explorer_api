'use strict';
/* ----------------- creating the server ----------------- */
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

require('dotenv').config();

/* ----------------- Setup Application Server ----------------- */

const app = express();
app.use(cors());

/* ----------------- Global Varibles ----------------- */

const locationIqKey = process.env.locationIqKey;
const weatherApiKey = process.env.weatherApiKey;
const parksApiKey = process.env.parksApiKey;
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

  const searchLocation = req.query.city;
  const locationDataUrl = `https://us1.locationiq.com/v1/search.php?key=${locationIqKey}&q=${searchLocation}&format=json`;
  superagent.get(locationDataUrl).then(locationDataReturn => {

    const locationData = locationDataReturn.body[0];
    const newLocation = new Location(
      searchLocation,
      locationData.display_name,
      locationData.lat,
      locationData.lon
    );
    res.send(newLocation);
  })
    .catch(error => {
      res.status(500).send('locationiq failed');
      console.log(error.message);
    });
});

app.get('/weather', (req, res) => {
  const searchLatitude = req.query.latitude;
  const searchLongitude = req.query.longitude;
  const weatherDataUrl = `https://api.weatherbit.io/v2.0/forecast/hourly?lat=${searchLatitude}&lon=${searchLongitude}&key=${weatherApiKey}&hours=48&units=I`;

  superagent.get(weatherDataUrl).then(weatherDataReturn => {
    console.log(weatherDataReturn.body.data);
    const weatherData = weatherDataReturn.body.data.map(weatherObj => {
      const newWeatherObj = new Weather(weatherObj);
      return newWeatherObj;
    });
    res.send(weatherData);
  })
    .catch(error => {
      res.status(500).send('WeatherApi failed');
      console.log(error.message);
    });
});

app.get('/parks', (req, res) => {
  const searchLocation = req.query.search_query;
  const parkDataUrl = `https://developer.nps.gov/api/v1/parks?q=${searchLocation}&api_key=${parksApiKey}`;

  superagent.get(parkDataUrl).then(parkDataReturn => {
    const parkData = parkDataReturn.body.data.map(parkObj => {
      const newparkObj = new Parks(parkObj);
      return newparkObj;
    });
    res.send(parkData);
  })
    .catch(error => {
      res.status(500).send('ParkApi failed');
      console.log(error.message);
    });
});
/* ----------------- Helper Functions ----------------- */

function Location(search_query, formatted_query, latitude, longitude) {
  this.search_query = search_query;
  this.formatted_query = formatted_query;
  this.longitude = longitude;
  this.latitude = latitude;
}

function Weather(weatherObj) {
  this.forecast = `${weatherObj.weather.description}, ${weatherObj.temp}ºF`;
  this.time = weatherObj.datetime;
}

function Parks(parksObj) {
  this.park_url = parksObj.url;
  this.name = parksObj.fullName;
  this.address = `${parksObj.addresses[0].line1} ${parksObj.addresses[0].city}, ${parksObj.addresses[0].stateCode} ${parksObj.addresses[0].postalCode}`;
  this.fee = parksObj.entranceFees[0].cost;
  this.description = parksObj.description;
}

/* ----------------- Start the server ----------------- */

app.listen(PORT, () => console.log(`we are up and running on ${PORT}`));
