'use strict';

//===============================Libraries==========================
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
require('dotenv').config();

//==============================Call Libraries========================
const app = express();
app.use(cors());

//==============================Global Variables=======================
const PORT = process.env.PORT || 3001;

//==============================Routes==========
app.get('/location', handleLocation);
function handleLocation(request, response) {

  let city = request.query.city;
  // let geoData = require('./data/location.json');
  // full url from site https://us1.locationiq.com/v1/search.php?key=YOUR_PRIVATE_TOKEN&q=SEARCH_STRING&format=json
  let url = `https://us1.locationiq.com/v1/search.php`;

  let queryParamaters = {
    key: process.env.GEOCODE_API_KEY,
    q: city,
    format:`json`,
    limit:1
  }

  superagent.get(url)
    .query(queryParamaters)//.query is a built in method
    .then(dataFromSuperAgent => {
      let geoData = dataFromSuperAgent.body;//superagent usually grabs from body
      const obj = new Location(city, geoData);
      response.status(200).send(obj);
    }).catch((error) => {
      console.log('ERROR',error);
      response.status(500).send('We messed something up, our bad!')
    });
}

app.get('/weather', handleWeather);
function handleWeather(request, response) {

  let url = `https://api.weatherbit.io/v2.0/current`;

  let queryParamaters = {
    key: process.env.WEATHER_API_KEY,
    units: `I`,
    city: request.query.city,
    // format:`json`,
    limit:8
  }

  superagent.get(url)
    .query(queryParamaters)//.query is a built in method
    .then(dataFromSuperAgent => {
      let forcast = dataFromSuperAgent.body;
      const forcastArray = forcast.data.map(day =>{
        return new Weather(day);
      })
      response.status(200).send(forcastArray);
    }).catch((error) => {
      console.log('ERROR',error);
      response.status(500).send('We messed something up, our bad!')
    });


  // let forcast = require('./data/weather.json');
  //changed forEach to map
//   const forcastArray = forcast.data.map(day => {
//     return new Weather(day);
//   })
//   response.send(forcastArray);
}

//========================Contructor Funtions===================
function Location(location, geoData){
  this.search_query = location;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

function Weather(obj){
  this.forecast = obj.weather.description;
  this.time = new Date(obj.datetime).toDateString();
}

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})

