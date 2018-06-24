'use strict';

var path = require('path');

module.exports = function (server) {
  var router = server.loopback.Router();
  // Install a `/status` route that returns server status
  router.get('/status', server.loopback.status());

  app.get('*', function(req, res){
    var indexFile = path.resolve(__dirname, '../..', server.get('indexFile'));
    res.sendFile(indexFile);
  });

  server.use(router);
};
