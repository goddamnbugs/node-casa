
/*!
 * node-casa
 * Copright(c) 2010 goddamnbugs.com
 * MIT Licensed
 */

var url = require('url'),
    http = require('http');

exports.version = '0.0.1';

exports.processFeed = function(feed, callback) {
  var THUMBSIZE = 0; // 0..2 possible mapping to 72x72, 144x144, 288x288 px

  feed.entry.forEach(function(entry) {
    entry.albumid = entry.gphoto$albumid.$t;
    if (entry.author) {
      entry.owner = entry.author[0].email.$t;
    } else {
      entry.owner = 'NOAUTHOR';
    }
    entry.title = entry.title.$t;
    entry.summary = entry.summary.$t;
    entry.thumb$url = entry.media$group.media$thumbnail[THUMBSIZE].url;
    entry.full$url = entry.content.src;
    entry.user$rss$url = 'http://picasaweb.google.com/data/feed/api/user/' + entry.owner;
    entry.album$rss$url = entry.user$rss$url + '/albumid/' + entry.albumid;
  });
  callback(undefined, feed);
};

exports.processAlbum = function(album, callback) {
  this.processFeed(album, function(err, album) {
    album.title = album.title.$t;
    album.updated = album.updated.$t;
    album.albumid = album.gphoto$id.$t;
    album.album$rss$url = album.id.$t;

    callback(undefined, album);
  })
};

exports.loadFeed = function(filepath, callback) {
  var json = this.loadSync(filepath);
  var feed = JSON.parse(json);
  this.processFeed(feed, callback);
};

exports.loadAlbum = function(filepath, callback) {
  var json = this.loadSync(filepath);
  var album = JSON.parse(json);
  this.processAlbum(album, callback);
};

exports.loadSync = function(filepath) {
  return require('fs').readFileSync(filepath, 'utf8');
};

exports.downloadFeed = function(callback) {
  var urlStr = "http://picasaweb.google.com/data/feed/api/all?max-results=250&filter=1&kind=photo&nocache=1263998895683&start-index=1&alt=json&access=public";
  var that = this;
  this.download(urlStr, function(err, json, options) {
    var feed = JSON.parse(json).feed;
    that.processFeed(feed, callback);
  });
};

exports.downloadAlbum = function(owner, albumid, callback) {
  var urlStr = "http://picasaweb.google.com/data/feed/api/user/" + owner + "/albumid/" + albumid + "?alt=json";
  var that = this;
  this.download(urlStr, function(err, json, options) {
    var album = JSON.parse(json).feed;
    that.processAlbum(album, callback);
  });
};

exports.download = function(urlStr, callback) {
  var urlObj = url.parse(urlStr);
  var port = urlObj.port || 80;
  var client = http.createClient(port, urlObj.hostname);
  var req = client.request('GET', urlObj.pathname + '?' + urlObj.query, {'host':urlObj.hostname});
  req.on('response', function(res) {
    var chunks = [],
        i = 0;
    res.on('data', function(chunk) {
      chunks[i++] = chunk;
    });
    res.on('end', function() {
      var err = undefined;
      var data = chunks.join('');
      var options = [];
      options.headers = JSON.stringify(res.headers);
      callback(err, data, options);
    });
  });
  req.end();
};
