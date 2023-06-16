const { rejects } = require('assert');
const fs = require('fs');
const path = require('path');

let items = [];
let categories = [];

const readItemsFile = () => {
  const filePath = path.join(__dirname, 'data', 'items.json');
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject('Unable to read items file');
      } else {
        items = JSON.parse(data);
        resolve();
      }
    });
  });
};

const readCategoriesFile = () => {
  const filePath = path.join(__dirname, 'data', 'categories.json');
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject('Unable to read categories file');
      } else {
        categories = JSON.parse(data);
        resolve();
      }
    });
  });
};

const initialize = () => {
  return new Promise((resolve, reject) => {
    readItemsFile()
      .then(() => readCategoriesFile())
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getAllItems = () => {
  return new Promise((resolve, reject) => {
    if (items.length === 0) {
      reject('No items found');
    } else {
      resolve(items);
    }
  });
};

const getPublishedItems = () => {
  return new Promise((resolve, reject) => {
    const publishedItems = items.filter((item) => item.published === true);
    if (publishedItems.length === 0) {
      reject('No published items found');
    } else {
      resolve(publishedItems);
    }
  });
};

const getCategories = () => {
  return new Promise((resolve, reject) => {
    if (categories.length === 0) {
      reject('No categories found');
    } else {
      resolve(categories);
    }
  });
};

module.exports = {
  initialize,
  getAllItems,
  getPublishedItems,
  getCategories,
};
