var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mongomapdb');

module.exports = mongoose;