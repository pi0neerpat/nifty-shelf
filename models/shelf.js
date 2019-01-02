var mongoose = require('mongoose');

var Shelf = mongoose.model('Shelf', {
  viewCount: {
    type: Number
  },
  shelfAddress: {
    type: String
  }
});

module.exports = { Shelf };
