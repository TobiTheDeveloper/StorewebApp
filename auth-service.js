const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcryptjs = require('bcryptjs');

// Define loginHistory sub-schema
const loginHistorySchema = new Schema({
  dateTime: { type: Date },
  userAgent: { type: String }
});

// Define userSchema according to the given specification
const userSchema = new Schema({
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  loginHistory: [loginHistorySchema]
});

let User; // to be defined on new connection

module.exports.initialize = function (connectionString) {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(connectionString);
    db.on('error', (err) => { reject(err); });
    db.once('open', () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

module.exports.registerUser = function (userData) {
    return new Promise((resolve, reject) => {
      if (userData.password !== userData.password2) {
        reject("Passwords do not match");
        return;
      }
  
      // Hash the password
      bcryptjs.hash(userData.password, 10)
        .then(hash => {
          userData.password = hash; // Replace the user's password with the hashed version
          let newUser = new User(userData);
          return newUser.save(); // Return the promise
        })
        .then(() => resolve())
        .catch(err => {
          if (err.code === 11000) reject("User Name already taken");
          else reject(`There was an error creating the user: ${err}`);
        });
    });
};

module.exports.checkUser = function (userData) {
    return new Promise((resolve, reject) => {
      User.findOne({ userName: userData.userName })
        .then(user => {
          if (!user) reject(`Unable to find user: ${userData.userName}`);
          else {
            return bcryptjs.compare(userData.password, user.password) // Compare passwords using bcrypt
              .then(result => {
                if (result) {
                  user.loginHistory.push({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });
                  return User.updateOne({ userName: user.userName }, { $set: { loginHistory: user.loginHistory } });
                } else {
                  reject(`Incorrect Password for user: ${userData.userName}`);
                }
              });
          }
        })
        .then(user => resolve(user))
        .catch(err => reject(`There was an error verifying the user: ${err}`));
    });
  };




  