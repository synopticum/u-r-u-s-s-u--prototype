var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/db', function (err) {
    if (err) throw err;
});

function callback (err, numAffected) {
   if (err) throw err;
}

module.exports = mongoose;