/**
 * casa.test.js
 */

var assert = require("assert"),
    casa = require("../node-casa");

exports.testTargetVersion = "0.0.1";

assert.ok(!!casa, "casa module.");
assert.ok(casa.version == this.testTargetVersion, "casa.version");

casa.downloadFeed(function(err, feed) {
  require('fs').writeFile('feed.json', JSON.stringify(feed));
//casa.loadFeed('./feed.json', function(err, feed) {
  assert.ok(!!feed, "feed");
  var entry = feed.entry[0];
  console.log(entry.albumid);
  console.log(entry.owner);
  console.log(entry.thumb$url);
  console.log(entry.album$rss$url);
  casa.downloadAlbum(entry.owner, entry.albumid, function(err, album) {
    require('fs').writeFile('album.json', JSON.stringify(album));
  //casa.loadAlbum('album.json', function(err, album) {
    assert.ok(!!album, "album");
    var entry = album.entry[0];
    console.log(entry.full$url);
  });
});
