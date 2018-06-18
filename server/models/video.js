'use strict';
const path = require('path');
const fs = require('fs');
const progress = require('progress-stream');
const constants = require('../../common/constants')

module.exports = Video => {

  Video.listAll = callback => {
    const {
      PersistentVideo
    } = Video.app.models;

    PersistentVideo.find((err, videos) => {
      callback(null, {
        data: videos
      })
    })

  };
  Video.remoteMethod('listAll', {
    description: "List all videos",
    returns: [{
      arg: 'result',
      type: 'object',
      default: [{
        name: 'Video 1',
        status: 'FINALIZADO'
      }, {
        name: 'Video 2',
        status: 'ENVIANDO'
      }]
    }, ],
    http: {
      path: '/',
      verb: 'get'
    },
  });

  Video.beforeRemote('listAllChangeStream', (ctx, unused, next) => {
    const {
      PersistentVideo
    } = Video.app.models;
    PersistentVideo.createChangeStream((err, changes) => {
      changes.on('data', change => {
        const {
          socket
        } = Video.app;

        Video.listAll((err, result) => {
          socket.emit(constants.VIDEO_LIST_CHANGED, result);
        })
      })
    });
    next();
  });
  Video.listAllChangeStream = (callback) => {
    Video.listAll(callback);
  };
  Video.remoteMethod('listAllChangeStream', {
    description: "List all videos with change stream",
    returns: [{
      arg: 'result',
      type: 'object',
      default: [{
        name: 'Video 1',
        status: 'FINALIZADO'
      }, {
        name: 'Video 2',
        status: 'ENVIANDO'
      }]
    }, ],
    http: {
      path: '/realtime-change',
      verb: 'get'
    },
  });

  Video.listById = (id, callback) => {
    const {
      PersistentVideo
    } = Video.app.models;

    PersistentVideo.findById(id, (err, video) => {
      callback(null, {
        data: video
      })
    })
  };
  Video.remoteMethod('listById', {
    description: "List a video by id",
    accepts: [{
      arg: 'id',
      type: 'number',
      required: true
    }],
    returns: {
      arg: 'result',
      type: 'object'
    },
    http: {
      path: '/:id',
      verb: 'get'
    },
  });

  Video.new = (req, res, callback) => {
    const {
      PersistentVideo,
      VideoFile
    } = Video.app.models;
    const file = req.files.content || req.files.file

    fs.stat(file.path, function (err, stats) {
      PersistentVideo.create({
          name: file.name,
          status: constants.VIDEO_STATUS_ENVIANDO
        })
        .then(createVideo => {

          const {
            socket
          } = Video.app;

          var writer = VideoFile.uploadStream('originals', `id${createVideo.id}-${file.name}`);

          var prog = progress({
            length: stats.size,
            time: 1000
          });

          prog.on('progress', function (progress) {
            socket.emit(constants.VIDEO_UPLOAD_PROGRESS, {
              id: createVideo.id,
              progress: progress.percentage
            });
          });

          writer.on('error', function (err) {
            console.log(err);
          })

          writer.on('finish', function (result) {
            createVideo.patchAttributes({
                status: constants.VIDEO_STATUS_ENCODANDO
              })
              .then(result => {
                //call encoding service
              });

          });

          fs.createReadStream(file.path)
            .pipe(prog)
            .pipe(writer);

        });
    });

    callback(null, "Iniciou o Upload.");

  };
  Video.remoteMethod('new', {
    description: "Include new video",
    accepts: [{
        arg: 'req',
        type: 'object',
        http: {
          source: 'req'
        }
      },
      {
        arg: 'res',
        type: 'object',
        http: {
          source: 'res'
        }
      }
    ],
    returns: {
      arg: 'result',
      type: 'object'
    },
    http: {
      path: '/',
      verb: 'post'
    },

  });

};
