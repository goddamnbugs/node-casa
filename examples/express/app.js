var express = require('express'),
    casa = require('../../node-casa');

var app = express.createServer();

app.get('/', function(req, res) {
  var tokens = [],
      i = 0;
  casa.downloadFeed(function(err, feed) {
    feed.entry.forEach(function(entry) {
      tokens[i++] = "<a href='/album?owner=" + entry.owner + "&albumid=" + entry.albumid +"'><img src='" + entry.thumb$url + "' /></a>"; 
    });

    res.send(tokens.join(''));
  });
});

app.get('/album', function(req, res) {
  var tokens = [],
      i = 0;
  var owner = req.query.owner || 'uhoh';
  var albumid = req.query.albumid || 'hotdog';
  
  casa.downloadAlbum(owner, albumid, function(err, album) {
    album.entry.forEach(function(entry) {
      tokens[i++] = "<a href='" + entry.full$url + "'><img src='" + entry.thumb$url + "' /></a>";
    });

    res.send(tokens.join(''));    
  })
});

app.listen(8080);
