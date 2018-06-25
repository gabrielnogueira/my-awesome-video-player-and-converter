'use strict';

var path = require('path');

module.exports = function (server) {
  var router = server.loopback.Router();
  // Install a `/status` route that returns server status
  router.get('/status', server.loopback.status());

  var indexFile = path.resolve(__dirname, '../..', server.get('indexFile'));

  router.get('/', function (req, res) {
    res.sendFile(indexFile);
  });

  router.get('/videos', function (req, res) {
    res.sendFile(indexFile);
  });

  router.get('/videos/:id', function (req, res) {
    res.sendFile(indexFile);
  });



  server.use(router);

};
