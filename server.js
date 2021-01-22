'use strict';
/* ----------------- creating the server ----------------- */
const express = require('express');//express is used to communicate between the front and the back end
const cors = require('cors');
const superagent = require('superagent');//gets the url and passes the data
const pg = require('pg');//our sql database handler

require('dotenv').config();//allows me to read the .env file

/* ----------------- Setup Application Server ----------------- */

const app = express();
app.use(cors());

const DATABASE_URL = process.env.DATABASE_URL;//add DATABASE_URL to .env
const client = new pg.Client(DATABASE_URL);
client.on('error', error => console.log(error));

/* ----------------- Global Varibles ----------------- */

const PORT = process.env.PORT || 3111;

/* ----------------- Routes ----------------- */

app.get('/', (req, res) => {
  res.send('And I suggest you let that one marinate.');
});

app.get('/location', (req, res) => {
  const searchLocation = req.query.city;
  const locationIqKey = process.env.locationIqKey;

  const sqlQuery = 'SELECT * FROM place WHERE search_query=$1';
  const sqlArray = [searchLocation];

  client.query(sqlQuery, sqlArray).then(result => {
    console.log(result.rows);

    if (result.rows.length !== 0) {
      console.log('Already in the database');
      res.send(result.rows[0]);
    } else {
      console.log('Get new data');
      if (req.query.city === '') {
        res.status(500).send('No Data, My Bad.');
        return;
      }

      const locationDataUrl = `https://us1.locationiq.com/v1/search.php?key=${locationIqKey}&q=${searchLocation}&format=json`;
      superagent.get(locationDataUrl).then(locationDataReturn => {

        const locationData = locationDataReturn.body[0];

        const newLocation = new Location(
          searchLocation,
          locationData.display_name,
          locationData.lat,
          locationData.lon
        );
        const sqlQuery = 'INSERT INTO place (search_query, formatted_query, latitude, longitude) VALUES($1, $2, $3, $4)';

        const sqlArray = [newLocation.search_query, newLocation.formatted_query, newLocation.latitude, newLocation.longitude];

        client.query(sqlQuery, sqlArray);
        res.send(newLocation);
      })
        .catch(error => {
          res.status(500).send('locationiq failed');
          console.log(error.message);
        });
    }
  });
});

app.get('/weather', (req, res) => {
  const weatherApiKey = process.env.weatherApiKey;
  const searchLatitude = req.query.latitude;
  const searchLongitude = req.query.longitude;

  const weatherDataUrl = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${searchLatitude}&lon=${searchLongitude}&key=${weatherApiKey}&days=8&units=I`;
  superagent.get(weatherDataUrl).then(weatherDataReturn => {

    const weatherData = weatherDataReturn.body.data.map(weatherObj => new Weather(weatherObj));
    res.send(weatherData);
  })
    .catch(error => {
      res.status(500).send('WeatherApi failed');
      console.log(error.message);
    });
});

app.get('/parks', (req, res) => {
  const parksApiKey = process.env.parksApiKey;
  const searchLocation = req.query.search_query;
  const parkDataUrl = `https://developer.nps.gov/api/v1/parks?q=${searchLocation}&api_key=${parksApiKey}&limit=5`;

  superagent.get(parkDataUrl).then(parkDataReturn => {

    const parkData = parkDataReturn.body.data.map(parkObj => new Parks(parkObj));
    res.send(parkData);
  })
    .catch(error => {
      res.status(500).send('ParkApi failed');
      console.log(error.message);
    });
});

app.get('/yelp', (req, res) => {
  const searchLocation = req.query.search_query;
  const YELP_API_KEY = process.env.YELP_API_KEY;
  const page = req.query.page;
  const offset = (page - 1) * 5;

  const yelpDataUrl = `https://api.yelp.com/v3/businesses/search?location=${searchLocation}&limit=3&offset=${offset}`;
  superagent.get(yelpDataUrl)
    .set('Authorization', `Bearer ${YELP_API_KEY}`)
    .then(yelpDataReturn => {
      const yelpData = yelpDataReturn.body.businesses.map(yelpObj => new Yelp(yelpObj));
      res.send(yelpData);
    })
    .catch(error => {
      res.status(500).send('Yelp API failed');
      console.log(error.message);
    });
});

app.get('/movies', (req, res) => {
  const searchLocation = req.query.search_query;
  const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
  const movieDataUrl = `https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&language=en-US&&query=${searchLocation}&page=1&include_adult=false`;
  superagent.get(movieDataUrl).then(movieDataReturn => {

    const movieData = movieDataReturn.body.results.map(movieObj => new Movies(movieObj));
    res.send(movieData);
  })
    .catch(error => {
      res.status(500).send('movieApi failed');
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
  this.forecast = `${weatherObj.weather.description}, ${weatherObj.max_temp}ºF`;
  this.time = weatherObj.valid_date;
}

function Parks(parksObj) {
  this.park_url = parksObj.url;
  this.name = parksObj.fullName;
  this.address = `${parksObj.addresses[0].line1} ${parksObj.addresses[0].city}, ${parksObj.addresses[0].stateCode} ${parksObj.addresses[0].postalCode}`;
  this.fee = parksObj.entranceFees[0].cost;
  this.description = parksObj.description;
}

function Movies(movieObj) {
  this.title = movieObj.original_title;
  this.overview = movieObj.overview;
  this.average_votes = movieObj.vote_count;
  this.image_url = 'https://image.tmdb.org/t/p/original' + movieObj.poster_path;
  this.popularity = movieObj.popularity;
  this.released_on = movieObj.release_date;
}

function Yelp(yelpObj) {
  this.url = yelpObj.url;
  this.name = yelpObj.name;
  this.rating = yelpObj.rating;
  this.price = yelpObj.price;
  this.image_url = yelpObj.image_url;
}

/* ----------------- Start the server ----------------- */
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`we are up and running on ${PORT}`));
  })
  .catch(error => console.log(error.message));
