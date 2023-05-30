/*********************************************************************************

WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Yusuff Oyediran 
Student ID: 142813203 
Date: 05/30/2023
Cyclic Web App URL: https://drab-pear-peacock-boot.cyclic.app/about
GitHub Repository URL: https://github.com/hack1011/web322-app

********************************************************************************/ 


const storeService = require('./store-server');
const data = require('./store-server');
const express = require('express');
const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('/about');
});

app.get('/about', (req, res) => {
  res.sendFile(__dirname + '/views/about.html');
});


app.get('/shop', (req, res) => {
  storeService.getPublishedItems()
    .then((items) => {
      res.json(items);
    })
    .catch((error) => {
      res.json({ message: error });
    });
});

app.get('/items', (req, res) => {
  storeService.getAllItems()
    .then((items) => {
      res.json(items);
    })
    .catch((error) => {
      res.json({ message: error });
    });
});

app.get('/categories', (req, res) => {
  storeService.getCategories()
    .then((categories) => {
      res.json(categories);
    })
    .catch((error) => {
      res.json({ message: error });
    });
});

storeService.initialize()
  .then(() => {
    const port = process.env.PORT || 8080;
    app.listen(port, () => {
      console.log(`Express http server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error initializing store service:', error);
});


