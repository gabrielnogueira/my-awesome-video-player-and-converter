'use strict';
//requires
const path = require('path');
const fs = require('fs');
const constants = require('../../common/constants')
const Zencoder = require('zencoder');

const keyFilename = "./firebase-api-key-file.json";
const projectId = "mavpac-48492"
const bucketName = `${projectId}.appspot.com`;

//inits
const zencoderClient = Zencoder('06616ad8a761507af6657a0d604f2964');
const gcs = require('@google-cloud/storage')({
  projectId,
  keyFilename
});
const bucket = gcs.bucket(bucketName);

//functions
const uploadVideoFile = (filePath, fileName, folderName, extension, video) => {

  return new Promise((resolve, reject) => {
    const uploadPath = `${folderName}/id${video.id}-${!extension ? fileName : fileName.split('.')[0]}${extension}`;
    bucket.upload(filePath, {
      destination: uploadPath,
      public: true
    }).then(uploadVideoResult => {
      resolve({video, uploadPath})
    }).catch(err=>reject({video, err}));
  })
}
const downloadFile = (url, dest, callback) => {
  var http = require("https");

  var options = {
    "method": "GET",
    "hostname": url.split('/o/')[0].replace('https://', ''),
    "path": url.split('amazonaws.com')[1],
  };

  var req = http.request(options, function (res) {
    res.pipe(fs.createWriteStream(dest));

    res.on("end", function () {
      callback();
    });
  });

  req.end();
};
const createPublicFileURL = storageName => {
  return `http://storage.googleapis.com/${bucketName}/${encodeURIComponent(storageName)}`;
}
const createConversionJob = video => {
  return new Promise((resolve, reject) => {
    zencoderClient.Job.create({
      input: video.urlOriginalVideo,
      test: true
    }, (err, result) => {
      if (err) {
        reject({video, err})        
        return;
      }
      resolve({video, id:result.outputs[0].id})
    })
  })
}

const verifyEnconding = result => {
  return new Promise((resolve, reject) => {
    executeVerify(result.id, resultSuccess => resolve({video:result.video, jobOutputResult:resultSuccess}), resultError => reject({video:result.video, err:resultError}) )
  })
}

const executeVerify = (id, onSuccess, onError) => {
  zencoderClient.Output.details(id, (err, result) => {
    if (err) {
      onError(err);
      return;
    }
    if (result.state !== 'finished') {
      setTimeout(() => executeVerify(id, onSuccess, onError), 2000);
      return;
    }
    onSuccess(result);
  });
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
        id: 1,
        name: 'Video 1',
        status: 'FINALIZADO',
        urlOriginalVideo: 'https://storagename/originals/video1.wmv',
        urlConvertedVideo: 'https://storagename/converted/video1.mp4'
      }, {
        id: 2,
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
  Video.listAllChangeStream = callback => {
    Video.listAll(callback);
  };
  Video.remoteMethod('listAllChangeStream', {
    description: "List all videos and open socket to listen modifications on list",
    returns: [{
      arg: 'result',
      type: 'object',
      default: [{
        id: 1,
        name: 'Video 1',
        status: 'FINALIZADO',
        urlOriginalVideo: 'https://storagename/originals/video1.wmv',
        urlConvertedVideo: 'https://storagename/converted/video1.mp4'
      }, {
        id: 2,
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
      type: 'object',
      default: {
        id: 1,
        name: 'Video 1',
        status: 'FINALIZADO',
        urlOriginalVideo: 'https://storagename/originals/video1.wmv',
        urlConvertedVideo: 'https://storagename/converted/video1.mp4'
      }
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
    const file = req.files.content || req.files.file;

    PersistentVideo.create({
        name: file.name      
      })
      .then(video => {
        callback(null, {message:"Iniciando o processo de upload!", title:"Aguarde!"});
        return uploadVideoFile(file.path, file.name, 'originals', null, video);
      })
      .then(result => {
        const {video, uploadPath} = result;
        return video.patchAttributes({
          status: constants.VIDEO_STATUS_ENCODANDO,
          urlOriginalVideo: createPublicFileURL(uploadPath)
        });
      })
      .then(createConversionJob)
      .then(verifyEnconding)
      .then(result => {
        const {video, jobOutputResult} = result;
        return uploadVideoFile(jobOutputResult.url, file.name, 'converted', '.mp4', video)
      })
      .then(result => {
        const {video, uploadPath} = result;
        return video.patchAttributes({
          status: constants.VIDEO_STATUS_FINALIZADO,
          urlConvertedVideo: createPublicFileURL(uploadPath)
        });
      }).catch(result=>{
        console.log(result.err);
        const {
          socket
        } = Video.app;

        result.video.patchAttributes({
          status: constants.VIDEO_STATUS_ERRO,
          urlConvertedVideo: null
        }).then(videoResult=>{
          socket.emit(constants.VIDEO_ERRO_MESSAGE, {message:'Algo inesperado aconteceu ao tentar converter o vídeo: ' + result.video.name, title:'Erro no processo de conversão'});
        })
      });
  }
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
