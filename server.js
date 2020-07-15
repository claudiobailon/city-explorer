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

  let url = `https://api.weatherbit.io/v2.0/forecast/daily`;

  let queryParamaters = {
    key: process.env.WEATHER_API_KEY,
    city: request.query.search_query,
    days:8
  }
  superagent.get(url)
    .query(queryParamaters)//.query is a built in method
    .then(dataFromSuperAgent => {
      let forcast = dataFromSuperAgent.body.data;
      const forcastArray = forcast.map(day =>{
        return new Weather(day);
      })
      response.status(200).send(forcastArray);
    }).catch((error) => {
      console.log('ERROR',error);
      response.status(500).send('We messed something up, our bad!')
    });

}

app.get('/trails', handleTrails);

function handleTrails(request,response){
  let url = `https://www.hikingproject.com/data/get-trails`;
  let queryParamaters ={
    lat: request.query.latitude,
    lon: request.query.longitude,
    key: process.env.TRAIL_API_KEY,
  }
  superagent.get(url)
    .query(queryParamaters)
    .then(dataFromSuperAgent =>{
      const trailsArray = dataFromSuperAgent.body.data.map(hike => {
        return new Trail(hike);
      })
    })
}

// [
//   {
//     "name": "Rattlesnake Ledge",
//     "location": "Riverbend, Washington",
//     "length": "4.3",
//     "stars": "4.4",
//     "star_votes": "84",
//     "summary": "An extremely popular out-and-back hike to the viewpoint on Rattlesnake Ledge.",
//     "trail_url": "https://www.hikingproject.com/trail/7021679/rattlesnake-ledge",
//     "conditions": "Dry: The trail is clearly marked and well maintained.",
//     "condition_date": "2018-07-21",
//     "condition_time": "0:00:00 "
//   },
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

