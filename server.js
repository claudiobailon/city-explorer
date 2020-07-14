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
app.get('/location', (request, response) => {
  try{
    let city = request.query.city;
    let geoData = require('./data/location.json');
    const obj = new Location(city, geoData);
    response.status(200).send(obj);
  }catch(error){
    console.log('ERROR',error);
    response.status(500).send('We messed something up, we are sorry')
  }
});

app.get('/weather', (request, response) => {
  let forcast = require('./data/weather.json');
  //changed for each to map
  const forcastArray = forcast.data.map(day => {
    return new Weather(day);
  })
  response.send(forcastArray);
})

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
