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

const fs = require("fs");
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('qbihgsyc', 'qbihgsyc', '7J3jNb2vhZfChOfh4iZcM0J9SudaDlhm', {
  host: 'stampy.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
      ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});

// Define the Item model
const Item = sequelize.define('Item', {
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  postDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  featureImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  published: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  price: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
});

// Define the Category model
const Category = sequelize.define('Category', {
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});


// Define the relationship between Item and Category
Item.belongsTo(Category, { foreignKey: 'category' });

// Sync the models with the database
let initialize = async () => {
  try {
      await sequelize.sync({ force: true });
      console.log('Database and tables synced!');
  } catch (error) {
      console.error('Error syncing the database:', error);
  }
};


// Add a new category
async function addCategory(categoryData) {
  try {
    for (const key in categoryData) {
      if (categoryData.hasOwnProperty(key) && categoryData[key] === "") {
        categoryData[key] = null;
      }
    }

    await Category.create(categoryData);
  } catch (error) {
    throw new Error('Unable to create category');
  }
}


// Delete a category by id
async function deleteCategoryById(id) {
  try {
    const numDeleted = await Category.destroy({
      where: {
        id: id
      }
    });

    if (numDeleted === 0) {
      throw new Error('Category not found');
    }
  } catch (error) {
    throw new Error('Error deleting category');
  }
}

// Delete a post by id
async function deletePostById(id) {
  try {
    const numDeleted = await Item.destroy({
      where: {
        id: id
      }
    });

    if (numDeleted === 0) {
      throw new Error('Post not found');
    }
  } catch (error) {
    throw new Error('Error deleting post');
  }
}

// Get all items
async function getAllItems() {
  try {
    const items = await Item.findAll();
    if (items.length === 0) {
      throw new Error('No results returned');
    }
    return items;
  } catch (error) {
    throw new Error('No results returned');
  }
}

// Get items by category
async function getItemsByCategory(categoryId) {
  try {
    const items = await Item.findAll({ where: { category: categoryId } });
    if (items.length === 0) {
      throw new Error('No results returned');
    }
    return items;
  } catch (error) {
    throw new Error('No results returned');
  }
}

// Get items by minimum date
async function getItemsByMinDate(minDateStr) {
  try {
    const { Op } = Sequelize;
    const items = await Item.findAll({
      where: {
        postDate: { [Op.gte]: new Date(minDateStr) }
      }
    });
    if (items.length === 0) {
      throw new Error('No results returned');
    }
    return items;
  } catch (error) {
    throw new Error('No results returned');
  }
}

// Get item by ID
async function getItemById(itemId) {
  try {
    const item = await Item.findAll({ where: { id: itemId } });
    if (item.length === 0) {
      throw new Error('No results returned');
    }
    return item[0];
  } catch (error) {
    throw new Error('No results returned');
  }
}

// Add an item
async function addItem(itemData) {
  try {
    itemData.published = !!itemData.published;
    for (const key in itemData) {
      if (itemData.hasOwnProperty(key) && itemData[key] === "") {
        itemData[key] = null;
      }
    }
    itemData.postDate = new Date();

    await Item.create(itemData);
  } catch (error) {
    throw new Error('Unable to create post');
  }
}

// Get all published items
async function getPublishedItems() {
  try {
    const items = await Item.findAll({ where: { published: true } });
    if (items.length === 0) {
      throw new Error('No results returned');
    }
    return items;
  } catch (error) {
    throw new Error('No results returned');
  }
}

// Get published items by category
async function getPublishedItemsByCategory(categoryId) {
  try {
    const items = await Item.findAll({ where: { published: true, category: categoryId } });
    if (items.length === 0) {
      throw new Error('No results returned');
    }
    return items;
  } catch (error) {
    throw new Error('No results returned');
  }
}

// Get all categories
async function getCategories() {
  try {
    const categories = await Category.findAll();
    if (categories.length === 0) {
      throw new Error('No results returned');
    }
    return categories;
  } catch (error) {
    throw new Error('No results returned');
  }
}

// Export the functions
module.exports = {
  initialize,
  getAllItems,
  getItemsByCategory,
  getItemsByMinDate,
  getItemById,
  addItem,
  getPublishedItems,
  getPublishedItemsByCategory,
  getCategories,
};

// let items = [];
// let categories = [];

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/items.json', 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                items = JSON.parse(data);

                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        categories = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
}

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
};

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


  


  
  



