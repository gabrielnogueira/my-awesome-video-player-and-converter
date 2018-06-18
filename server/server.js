'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var formidable = require('express-formidable');
var path = require('path');
var socket = require('socket.io')
var app = module.exports = loopback();

app.start = function () {
  var staticFolder = path.dirname(
    path.resolve(__dirname, '..', app.get('indexFile'))
  );
  app.use(loopback.static(staticFolder));
  app.use(formidable());

  // start the web server
  return app.listen(function () {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module) {

    app.socket = socket(app.start());
    app.socket.on('connection', function (socket) {
      console.log('a user connected');
      socket.on('disconnect', function () {
        console.log('user disconnected');
      });
    });
  }
});