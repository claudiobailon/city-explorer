'use strict';

//===============================Libraries==========================
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
require('dotenv').config();
const pg = require('pg');

//==============================Call Libraries========================
const app = express();
app.use(cors());
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.log('ERROR', err));
//==============================Global Variables=======================
const PORT = process.env.PORT || 3001;

//==============================Routes=================================
app.get('/location', handleLocation);
function handleLocation(request, response) {

  let city = request.query.city;
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
      const trailsArray = dataFromSuperAgent.body.trails.map(hike => {
        return new Trail(hike);
      })
      response.status(200).send(trailsArray);
      console.log('this is what is coming back', trailsArray);
    }).catch((error) => {
      console.log('ERROR',error);
      response.status(500).send('We messed something up, our bad!')
    });
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

function Trail(obj){
  this.name= obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditionsDetails;
  let conditionTime = obj.conditionDate.split(' ');
  this.condition_date = conditionTime[0];
  this.condition_time = conditionTime[1];
}

//====================start server=======================================

client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`listening on ${PORT}`));
  }).catch(err => console.log('ERROR',err));

