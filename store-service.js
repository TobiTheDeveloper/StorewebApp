/********************************************************************************* 

WEB322 – Assignment 02 
I declare that this assignment is my own work in accordance with Seneca
Academic Policy.  No part of this assignment has been copied manually or 
electronically from any other source (including 3rd party web sites) or 
distributed to other students. I acknoledge that violation of this policy
to any degree results in a ZERO for this assignment and possible failure of
the course. 

Name:   
Student ID:   
Date:  
Cyclic Web App URL:  
GitHub Repository URL:  

********************************************************************************/  

const fs = require("fs");
const { Sequelize, DataTypes } = require('sequelize');


module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/items.json', 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './data/database.db'
  });
  
  // Define the Item model
  const Item = sequelize.define('Item', {
    body: {
      type: DataTypes.TEXT
    },
    title: {
      type: DataTypes.STRING
    },
    postDate: {
      type: DataTypes.DATE
    },
    featureImage: {
      type: DataTypes.STRING
    },
    published: {
      type: DataTypes.BOOLEAN
    },
    price: {
      type: DataTypes.DOUBLE
    }
  });
  
  // Define the Category model
  const Category = sequelize.define('Category', {
    category: {
      type: DataTypes.STRING
    }
  });
  
  // Define the relationship between Item and Category
  Item.belongsTo(Category, { foreignKey: 'categoryId' });
  
  // Sync the models with the database
  sequelize.sync()
    .then(() => {
      console.log('Models synced successfully.');
    })
    .catch((error) => {
      console.error('Error syncing models:', error);
    });
  
  // Export the models
  module.exports.Item = Item;
  module.exports.Category = Category;

// getItemById function
module.exports.getItemById = function (id) {
    return Item.findByPk(id)
      .then((item) => {
        if (item) {
          return item;
        } else {
          throw new Error('No results returned');
        }
      });
  };

// getAllItems function
module.exports.getAllItems = function () {
    return Item.findAll()
      .then((items) => {
        if (items.length > 0) {
          return items;
        } else {
          throw new Error('No results returned');
        }
      });
  };

// getPublishedItems function
module.exports.getPublishedItems = function () {
    return Item.findAll({
      where: {
        published: true
      }
    })
      .then((items) => {
        if (items.length > 0) {
          return items;
        } else {
          throw new Error('No results returned');
        }
      });
  };

// getCategories function
module.exports.getCategories = function () {
    return Category.findAll()
      .then((categories) => {
        if (categories.length > 0) {
          return categories;
        } else {
          throw new Error('No results returned');
        }
      });
  };

// addItem function
module.exports.addItem = function (itemData) {
    itemData.published = !!itemData.published; 
    for (const prop in itemData) {
      if (itemData[prop] === '') {
        itemData[prop] = null;
      }
    }
    
  itemData.postDate = new Date(); 

  return Item.create(itemData)
    .then(() => {
      console.log('Item created successfully.');
    })
    .catch((error) => {
      throw new Error('Unable to create post');
    });
};

// getItemsByCategory function
module.exports.getItemsByCategory = function (category) {
    return Item.findAll({
      where: {
        category: category
      }
    })
      .then((items) => {
        if (items.length > 0) {
          return items;
        } else {
          throw new Error('No results returned');
        }
      });
  };

// getItemsByMinDate function
module.exports.getItemsByMinDate = function (minDateStr) {
    const { Op } = Sequelize;
    return Item.findAll({
      where: {
        postDate: {
          [Op.gte]: new Date(minDateStr)
        }
      }
    })
      .then((items) => {
        if (items.length > 0) {
          return items;
        } else {
          throw new Error('No results returned');
        }
      });
  }

// getPublishedItemsByCategory function
module.exports.getPublishedItemsByCategory = function (category) {
    return Item.findAll({
      where: {
        published: true,
        category: category
      }
    })
      .then((items) => {
        if (items.length > 0) {
          return items;
        } else {
          throw new Error('No results returned');
        }
      });
};

module.exports.addCategory = function (categoryData) {
    // Replace empty string properties with null
    for (const prop in categoryData) {
      if (categoryData[prop] === '') {
        categoryData[prop] = null;
      }
    }
  
    return Category.create(categoryData)
      .then(() => {
        console.log('Category created successfully.');
      })
      .catch((error) => {
        throw new Error('Unable to create category');
      });
};

module.exports.deleteCategoryById = function (id) {
    return Category.destroy({
      where: {
        id: id
      }
    })
      .then((rowsDeleted) => {
        if (rowsDeleted > 0) {
          console.log('Category deleted successfully.');
        } else {
          throw new Error('Category not found or could not be deleted.');
        }
      })
      .catch((error) => {
        throw new Error('Error deleting category');
      });
};
  

module.exports.deletePostById = function (id) {
    return Item.destroy({
      where: {
        id: id
      }
    })
      .then((rowsDeleted) => {
        if (rowsDeleted > 0) {
          console.log('Post deleted successfully.');
        } else {
          throw new Error('Post not found or could not be deleted.');
        }
      })
      .catch((error) => {
        throw new Error('Error deleting post');
      });
};
  


  
  



