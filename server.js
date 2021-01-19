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

/* ----------------- Helper Functions ----------------- */

function Location(search_query, formatted_query, latitude, longitude) {
  this.search_query = search_query;
  this.formatted_query = formatted_query;
  this.longitude = longitude;
  this.latitude = latitude;
}



/* ----------------- Start the server ----------------- */

app.listen(PORT, () => console.log(`we are up and running on ${PORT}`));
