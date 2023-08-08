/********************************************************************************* 

WEB322 – Assignment 06
I declare that this assignment is my own work in accordance with Seneca
Academic Policy.  No part of this assignment has been copied manually or 
electronically from any other source (including 3rd party web sites) or 
distributed to other students. I acknoledge that violation of this policy
to any degree results in a ZERO for this assignment and possible failure of
the course. 

Name:   Yusuff Oyediran
Student ID:   142813203
Date:  7/19/2023
Cyclic Web App URL:  https://real-jade-kitten-shoe.cyclic.app/
GitHub Repository URL:  https://github.com/hack1011/web322-app

********************************************************************************/
const express = require('express');
const itemData = require("./store-service");
const authData = require("./auth-service");
const storeData = require('./store-service');
const clientSessions = require('client-sessions');
const path = require("path");

// 3 new modules, multer, cloudinary, streamifier
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const exphbs = require("express-handlebars");
const { Console } = require("console");

// Configure Cloudinary. This API information is
// inside of the Cloudinary Dashboard - https://console.cloudinary.com/
cloudinary.config({
  cloud_name: 'dsngo0ucf',
  api_key: '815917813196375',
  api_secret: 'XZRblsdyaqxB9zUjSE7iDW5ubt8',
  secure: true
});

//  "upload" variable without any disk storage
const upload = multer(); // no { storage: storage }

const app = express();

const HTTP_PORT = process.env.PORT || 3000;

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

//This will add the property "activeRoute" to "app.locals" whenever the route changes, i.e. if our route is "/store/5", the app.locals.activeRoute value will be "/store".  Also, if the shop is currently viewing a category, that category will be set in "app.locals".
app.use(function (req, res, next) {
  let route = req.path.substring(1);

  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));

  app.locals.viewingCategory = req.query.category;

  next();
});

const Sequelize = require('sequelize');

// set up sequelize to point to our postgres database
const sequelize = new Sequelize('lpnuddxr', 'lpnuddxr', 'maVsIe5DntHEOhFRMR-qq8JIOsIE4abG', {
    host: 'trumpet.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

sequelize
    .authenticate()
    .then(function() {
        console.log('Connection has been established successfully.');
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err);
});

app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      navLink: function(url, options){
        return (
          '<li class="nav-item"><a ' +
          (url == app.locals.activeRoute
            ? ' class="nav-link active" '
            : ' class="nav-link" ') +
          ' href="' + 
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
        }
      },
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        let day = dateObj.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
  })
);

app.set('view engine', '.hbs');

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://yusuffoyediranyo:qfL3mWnzOAF3IL9j@senecaweb-app.khhteiw.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  if (err) {
    console.error('Failed to connect to MongoDB:', err);
    return;
  }
  console.log('Connected successfully to MongoDB');
  // Your code to interact with the database goes here
  client.close(); // Remember to close the connection when done
});



storeData.initialize()
  .then(() => authData.initialize(uri))
  .then(function(){
    app.listen(HTTP_PORT, function(){
      console.log("app listening on: " + HTTP_PORT);
    });
  })
  .catch(function(err){
    console.log("unable to start server: " + err);
});


app.use(clientSessions({
  cookieName: 'session',
  secret: 'web222_assign06', 
  duration: 2 * 60 * 1000,
  activeDuration: 1000 * 60 
}));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

app.use('/items', ensureLogin);
app.use('/categories', ensureLogin);
app.use('/post', ensureLogin);
app.use('/category', ensureLogin);

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  console.log("Request body:", req.body); // Log the request body

  authData.registerUser(req.body)
    .then(() => res.render('register', { successMessage: "User created" }))
    .catch(err => {
      console.log("Error:", err); // Log the error
      res.render('register', { errorMessage: err, userName: req.body ? req.body.userName : '' });
    });
});


app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      };
      res.redirect('/items');
    })
    .catch(err => res.render('login', { errorMessage: err, userName: req.body.userName }));
});

app.get('/logout', (req, res) => {
  req.session.reset(); 
  res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory');
});

app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/shop", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "item" objects
    let items = [];

    // if there's a "category" query, filter the returned items by category
    if (req.query.category) {
      // Obtain the published "items" by category
      console.log('categories');
      items = await itemData.getPublishedItemsByCategory(req.query.category);
    } else {
      // Obtain the published "items"
      items = await itemData.getPublishedItems();
    }

    // sort the published items by postDate
    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest item from the front of the list (element 0)
    let item = items[0];

    // store the "items" and "item" data in the viewData object (to be passed to the view)
    viewData.items = items;
    viewData.item = item;

  } 
  catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await itemData.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", { data: viewData });
});

// Update the '/Items' route to handle empty data
app.get('/Items', async (req, res) => {
  try {
    const items = await storeService.getAllItems();
    if (items.length > 0) {
      res.render('Items', { Items: items });
    } else {
      res.render('Items', { message: 'No results' });
    }
  } catch (error) {
    res.render('Items', { error: 'Error fetching data' });
  }
});

// A route for items/add
app.get("/items/add", async (req, res) => {
  try {
    const categories = await storeService.getCategories();
    res.render("addPost", { categories });
  } catch (err) {
    res.render("addPost", { categories: [] });
  }
});

app.post("/items/add", upload.single("featureImage"), (req, res) => {
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

    upload(req).then((uploaded) => {
      processItem(uploaded.url);
    });
  } else {
    processItem("");
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;

    // TODO: Process the req.body and add it as a new Item before redirecting to /items
    itemData
      .addItem(req.body)
      .then((post) => {
        res.redirect("/items");
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
});

app.post('/categories/add', (req, res) => {
  const categoryData = req.body;
  storeService.addCategory(categoryData)
    .then(() => {
      res.redirect('/categories');
    })
    .catch((error) => {
      res.render('error', { error: 'Unable to create category' });
    });
});

app.post('/categories/delete/:id', (req, res) => {
  const categoryId = req.params.id;
  storeService.deleteCategoryById(categoryId)
    .then(() => {
      res.redirect('/categories');
    })
    .catch((error) => {
      res.render('error', { error: 'Category not found or could not be deleted.' });
    });
});

app.post('/items/delete/:id', (req, res) => {
  const itemId = req.params.id;
  storeService.deletePostById(itemId)
    .then(() => {
      res.redirect('/items');
    })
    .catch((error) => {
      res.render('error', { error: 'Post not found or could not be deleted.' });
    });
});

// Update the '/categories' route to handle empty data
app.get('/categories', async (req, res) => {
  try {
    const categories = await storeService.getCategories();
    if (categories.length > 0) {
      res.render('categories', { Categories: categories });
    } else {
      res.render('categories', { message: 'No results' });
    }
  } catch (error) {
    res.render('categories', { error: 'Error fetching data' });
  }
});

app.get('/shop/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "item" objects
      let items = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          items = await itemData.getPublishedItemsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          items = await itemData.getPublishedItems();
      }

      // sort the published items by postDate
      items.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the item by "id"
      viewData.item = await itemData.getItemById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await itemData.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", {data: viewData})
});

app.get('/categories/add', (req, res) => {
  res.render('addCategory');
});

app.post('/categories/add', (req, res) => {
  const categoryData = req.body;
  storeService
    .addCategory(categoryData)
    .then(() => {
      res.redirect('/categories');
    })
    .catch((error) => {
      res.status(500).send('Unable to create category');
    });
});

app.get('/categories/delete/:id', (req, res) => {
  const categoryId = req.params.id;
  storeService
    .deleteCategoryById(categoryId)
    .then(() => {
      res.redirect('/categories');
    })
    .catch((error) => {
      res.status(500).send('Unable to Remove Category / Category not found');
    });
}); 


app.get('/items/delete/:id', (req, res) => {
  const postId = req.params.id;
  storeService.deletePostById(postId)
    .then(() => {
      res.redirect('/items');
    })
    .catch((error) => {
      res.status(500).send('Unable to Remove Post / Post not found');
    });
});

app.use((req, res) => {
  res.status(404).render("404");
})

itemData.initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("server listening on: " + HTTP_PORT);
    });
  })
  .catch((err) => {
    console.log(err);
});