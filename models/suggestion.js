var mongoose = require('mongoose');

var Suggestion = mongoose.model('Suggestion', {
  suggestion: {
    type: String
  }
});

module.exports = { Suggestion };
