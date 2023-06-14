/*********************************************************************************

WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Yusuff Oyediran 
Student ID: 142813203 
Date: 06/14/2023
Cyclic Web App URL: https://drab-pear-peacock-boot.cyclic.app/about
GitHub Repository URL: https://github.com/hack1011/web322-app

********************************************************************************/


const path = require('path');
const storeService = require('./store-server');
const data = require('./store-server');
const express = require('express');
const app = express();
app.use(express.static('public'));

const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const upload = multer();


cloudinary.config({
  cloud_name: 'dsngo0ucf',
  api_key: '815917813196375',
  api_secret: 'XZRblsdyaqxB9zUjSE7iDW5ubt8',
  secure: true
});

const { getItemsByCategory, getItemsByMinDate, getItemById } = require('./store-service');


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
  const category = req.query.category;
  const minDate = req.query.minDate;

  if (category) {
    getItemsByCategory(category)
      .then((items) => res.json(items))
      .catch((err) => res.status(500).json({ error: err }));
  } else if (minDate) {
    getItemsByMinDate(minDate)
      .then((items) => res.json(items))
      .catch((err) => res.status(500).json({ error: err }));
  } else {
    res.json(items);
  }
});

app.get('/item/:value', (req, res) => {
  const itemId = req.params.value;
  getItemById(itemId)
    .then((item) => res.json(item))
    .catch((err) => res.status(500).json({ error: err }));
});

app.post("items/add", upload.single('featureImage'), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

  async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
  }

  upload(req)
      .then((uploaded) => {
        processItem(uploaded.url);
      });
    } else {
      processItem('');
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;
    // TODO: Process the req.body and add it as a new Item before redirecting to /items

  //   const itemData = {
  //     // extract other properties from req.body
  //     title: req.body.title,
  //     price: req.body.price,
  //     body: req.body.body,
  //     category: req.body.category,
  //     published: req.body.published,
  //   };

  //   storeService
  //     .addItem(itemData)
  //     .then((newItem) => {
  //       // Redirect the user to the /items route
  //       res.redirect("/items");
  //     })
  //     .catch((error) => {
  //       console.error(error);

  //     });
   }
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


