/********************************************************************************* 

WEB322 – Assignment 05
I declare that this assignment is my own work in accordance with Seneca
Academic Policy.  No part of this assignment has been copied manually or 
electronically from any other source (including 3rd party web sites) or 
distributed to other students. I acknoledge that violation of this policy
to any degree results in a ZERO for this assignment and possible failure of
the course. 

Name:   Yusuff Oyediran
Student ID:   142813203
Date:  7/19/2023
Cyclic Web App URL:  
GitHub Repository URL:  https://github.com/hack1011/web322-app

********************************************************************************/

const express = require("express");
const itemData = require("./store-service");
const path = require("path");

// 3 new modules, multer, cloudinary, streamifier
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// AS4, Setup handlebars
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

const HTTP_PORT = process.env.PORT || 8000;
app.use(express.static("public"));

const Sequelize = require('sequelize');

// set up sequelize to point to our postgres database
var sequelize = new Sequelize('qbihgsyc', 'qbihgsyc', '7J3jNb2vhZfChOfh4iZcM0J9SudaDlhm', {
    host: 'stampy.db.elephantsql.com',
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

// Set up Handlebars
const hbs = exphbs.create({
  // Handlebars configurations
  extname: ".handlebars",
  helpers: {
      navLink: function (url, options) {
          return (
              '<li class="nav-item"><a' +
              (url == app.locals.activeRoute
                  ? ' class="nav-link active"'
                  : ' class="nav-link"') +
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
      },
      formatDate: function (dateObj) {
          let year = dateObj.getFullYear();
          let month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
          let day = dateObj.getDate().toString().padStart(2, '0');
          return `${year}-${month}-${day}`;
      }
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));



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

app.get('/items', (req, res) => {
  storeService.getAllItems()
    .then((items) => {
      if (items.length > 0) {
        res.render('items', { Items: items });
      } else {
        res.render('items', { message: 'No results' });
      }
    })
    .catch((error) => {
      res.render('items', { message: 'Error fetching data' });
    });
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

app.get("/categories", (req, res) => {
  storeService.getCategories()
    .then((categories) => {
      if (categories.length > 0) {
        res.render('categories', { Categories: categories });
      } else {
        res.render('categories', { message: 'No results' });
      }
    })
    .catch((error) => {
      res.render('categories', { message: 'Error fetching data' });
    });
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


// const hbs = exphbs.create({
//   // Handlebars configurations
//   helpers: {
//     formatDate: function(dateObj) {
//       let year = dateObj.getFullYear();
//       let month = (dateObj.getMonth() + 1).toString();
//       let day = dateObj.getDate().toString();
//       return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
//     }
//   }
// });

app.get('/items/delete/:id', (req, res) => {
  const itemId = req.params.id;
  storeService
    .deletePostById(itemId)
    .then(() => {
      res.redirect('/items');
    })
    .catch((error) => {
      res.status(500).send('Unable to Remove Item / Item not found');
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
