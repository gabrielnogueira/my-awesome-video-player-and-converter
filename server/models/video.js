'use strict';
const path = require('path');
const fs = require('fs');
const progress = require('progress-stream');
const constants = require('../../common/constants')

const keyFilename = "./firebase-api-key-file.json";
const projectId = "mavpac-48492"
const bucketName = `${projectId}.appspot.com`;

const Zencoder = require('zencoder');

const zencoderClient = Zencoder('06616ad8a761507af6657a0d604f2964');

const gcs = require('@google-cloud/storage')({
  projectId,
  keyFilename
});

const bucket = gcs.bucket(bucketName);

const uploadFile = (filePath, uploadPath) => {
  return bucket.upload(filePath, {
    destination: uploadPath,
    public: true
  });
}

const downloadFile = (url, dest, callback) => {
  var http = require("https");

  // var options = {
  //   "method": "GET",
  //   "hostname": "zencoder-temp-storage-us-east-1.s3.amazonaws.com",
  //   "path": "/o/20180619/78d5357d8d56f1bbc0832f497dd0e08b/779cd4047e8bd63135bfbf0f9dd2e8b0.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAI456JQ76GBU7FECA%2F20180619%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20180619T052914Z&X-Amz-Expires=81056&X-Amz-SignedHeaders=host&X-Amz-Signature=577ad856b305d6c9b5f50cfc26cd251141cb9dfbc61d18dea8a210869e859d05",
  // };

  // var options = {
  //   "method": "GET",
  //   "hostname": url.split('/o/')[0].replace('https://', ''),
  //   "path": url.split('amazonaws.com')[1],
  // };
  
  console.log(options);

  var req = http.request(options, function (res) {
    res.pipe(fs.createWriteStream(dest));

    res.on("end", function () {
      callback();
    });

  });

  req.end();
};

const createPublicFileURL = (storageName) => {
  return `http://storage.googleapis.com/${bucketName}/${encodeURIComponent(storageName)}`;
}

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
      PersistentVideo
    } = Video.app.models;
    const file = req.files.content || req.files.file

    PersistentVideo.create({
      name: file.name,
      status: constants.VIDEO_STATUS_ENVIANDO
    }).then(createVideo => {
      uploadFile(file.path, `originals/id${createVideo.id}-${file.name}`).then(result => {
        createVideo.patchAttributes({
          status: constants.VIDEO_STATUS_ENCODANDO,
          url: createPublicFileURL(`originals/id${createVideo.id}-${file.name}`)
        }).then(result => {
          zencoderClient.Job.create({
              input: result.url,
              test: true
            })
            .then(({
              data
            }) => {

              //TEM QUE VERIFICAR SE JA ACABOU DE ENCODAR, QUANDO TIVER ACABADO CONTINUAR  
              downloadFile(data.outputs[0].url, `temp/id${result.id}-${file.name.split('.')[0]}.mp4`, (err) => {
                if (err) {
                  console.log(err);
                  return;
                }
                uploadFile(`temp/id${result.id}-${file.name.split('.')[0]}.mp4`, `converted/id${result.id}-${file.name.split('.')[0]}.mp4`).then(ret => {
                  result.patchAttributes({
                    status: constants.VIDEO_STATUS_FINALIZADO,
                    url: createPublicFileURL(`converted/id${result.id}-${file.name.split('.')[0]}.mp4`)
                  }).then(resultPatched => {
                    fs.unlink(`temp/id${result.id}-${file.name.split('.')[0]}.mp4`);
                  })
                })
              })
            })
            .catch(err => console.log(err));
        });
      }).catch(console.log);
    })
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
