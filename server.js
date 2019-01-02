const _ = require('lodash');
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
require('./db/config'); // Database login secrets
var { db } = require('./db/mongoose');
var { Shelf } = require('./models/shelf');
var { Suggestion } = require('./models/suggestion');

var app = express();
app.set('port', 3001);
app.use(bodyParser.json());

app.post('/suggestion', (req, res) => {
  const suggestion = req.body.suggestion;
  console.log(' ');
  console.log('################## POST #####################');
  console.log(`Suggestion: ${suggestion}`);

  Suggestion.findOneAndUpdate(
    { suggestion },
    { $set: { suggestion } },
    {
      upsert: true,
      new: true
    },
    function() {
      console.log('Suggestion recorded successfully!');
    }
  );
});
app.get('/shelf/:shelfAddress', (req, res) => {
  var shelfAddress = req.params.shelfAddress.toLowerCase();
  console.log(' ');
  console.log('################## GET #####################');
  console.log(`URL: https://niftyshelf.com/${shelfAddress}`);

  Shelf.findOneAndUpdate(
    { shelfAddress },
    { $inc: { viewCount: 1 } },
    {
      upsert: true,
      new: true
    },
    (err, shelf) => {
      console.log('Shelf created/updated successfully!');
      if (shelf !== null) {
        res.send({
          viewCount: shelf.viewCount
        });
      } else if (err) {
        console.log(`No contract found`);
        res.status(404).send(`Contract not found: ${mnemonic}`);
      }
    }
  );
});

if (process.env.NODE_ENV === 'production') {
  app.set('port', 4000);
  app.use(express.static('client/build'));
  app.use('*', express.static('client/build'));
}

app.listen(app.get('port'), () => {
  console.log(
    `_______________________________________________________________`
  );
  console.log(` `);
  console.log(`################# Nifty Shelf API Server ####################`);
  console.log(` `);
  console.log(`Started on port ${app.get('port')}`);
  console.log(`______________________________________________________________`);
  console.log(` `);
});
module.exports = { app };
