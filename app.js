var express = require('express');
var db = require('./lib/db');
var debug = require('debug')('debug');

var app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));


app.get('/', function (req, res) {
  db.getVisitorsStats(function(err, visitors) {
    if (err) {
      res.sendStatus(502);
    }
    db.getClonesStats(function(err, clones) {
      if (err) {
        res.sendStatus(502);
      }
      res.render('index', {visitorsStats: JSON.stringify(visitors), clonesStats: JSON.stringify(clones)});
    });
  });
})

db.setup();
app.listen(3000, function () {
  debug('up and running on port 3000');
})