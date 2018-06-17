'use strict';

module.exports = function (Video) {

  Video.listAll = function (cb) {
    cb(null, {
      message: "List of all videos"
    });
  }

  Video.remoteMethod('listAll', {
    description: "List all videos",
    returns: [{
      arg: 'result',
      type: 'object'
    }, ],
    http: {
      path: '/',
      verb: 'get'
    },
  });

  Video.listById = function (id, cb) {
    cb(null, {
      message: "A video id: " + id
    });
  }

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

  Video.new = function (data, cb) {
    cb(null, "New video upload");
  }

  Video.remoteMethod('new', {
    description: "Include new video",
    accepts: [{
        arg: 'data',
        type: 'object',
        required: true,
        http: {
          source: 'body'
        },
      },
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

  Video.update = function (id, data, cb) {
    cb(null, "Updated video id: " + id);
  }

  Video.remoteMethod('update', {
    description: "Update existing or create new video in id",
    accepts: [{
        arg: 'id',
        type: 'number',
        required: true
      }, {
        arg: 'data',
        type: 'object',
        required: true,
        http: {
          source: 'body'
        },
      }
    ],
    returns: {
      arg: 'result',
      type: 'object'
    },
    http: {
      path: '/:id',
      verb: 'put'
    },
  });

  Video.updatePartial = function (id, data, cb) {
    cb(null, "Updated partial video id:" + id);
  }

  Video.remoteMethod('updatePartial', {
    description: "Update properties of existing video by id",
    accepts: [{
        arg: 'id',
        type: 'number',
        required: true
      }, {
        arg: 'data',
        type: 'object',
        required: true,
        http: {
          source: 'body'
        },
      }
    ],
    returns: {
      arg: 'result',
      type: 'object'
    },
    http: {
      path: '/:id',
      verb: 'patch'
    },
  });
};
