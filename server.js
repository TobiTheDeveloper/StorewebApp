/*********************************************************************************

WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Yusuff Oyediran 
Student ID: 142813203 
Date: 05/30/2023
Cyclic Web App URL: https://drab-pear-peacock-boot.cyclic.app/about
GitHub Repository URL: https://github.com/hack1011/web322-app

********************************************************************************/


const path = require('path');
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

app.get('/items/add', (req, res) => {
  res.sendFile(__dirname + '/views/addItem.html');
});

app.post('/items/add', upload.single('featureImage'), (req, res) => {
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
      })
      .catch((error) => {
        console.error(error);
        processItem('');
      });
  } else {
    processItem('');
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;
    // TODO: Process the req.body and add it as a new Item before redirecting to /items
    addItem(req.body)
    .then((newItem) => {
      console.log('New item added:', newItem);
      res.redirect('/items');
    })
    .catch((error) => {
      console.error('Error adding item:', error);
      res.redirect('/items');
    });  
    res.redirect('/items');
  }
});

app.get('/item/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  const item = storeService.getItemById(itemId);

  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
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


