(function (QUnit,videojs) {
'use strict';

QUnit = QUnit && QUnit.hasOwnProperty('default') ? QUnit['default'] : QUnit;
videojs = videojs && videojs.hasOwnProperty('default') ? videojs['default'] : videojs;

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var empty = {};


var empty$1 = (Object.freeze || Object)({
	'default': empty
});

var minDoc = ( empty$1 && empty ) || empty$1;

var topLevel = typeof commonjsGlobal !== 'undefined' ? commonjsGlobal :
    typeof window !== 'undefined' ? window : {};


var doccy;

if (typeof document !== 'undefined') {
    doccy = document;
} else {
    doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }
}

var document_1 = doccy;

var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof commonjsGlobal !== "undefined") {
    win = commonjsGlobal;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

var window_1 = win;

/**
 * Validates a number of seconds to use as the auto-advance delay.
 *
 * @private
 * @param   {number} s
 *          The number to check
 *
 * @return  {boolean}
 *          Whether this is a valid second or not
 */
var validSeconds = function validSeconds(s) {
  return typeof s === 'number' && !isNaN(s) && s >= 0 && s < Infinity;
};

/**
 * Resets the auto-advance behavior of a player.
 *
 * @param {Player} player
 *        The player to reset the behavior on
 */
var reset = function reset(player) {
  var aa = player.playlist.autoadvance_;

  if (aa.timeout) {
    player.clearTimeout(aa.timeout);
  }

  if (aa.trigger) {
    player.off('ended', aa.trigger);
  }

  aa.timeout = null;
  aa.trigger = null;
};

/**
 * Sets up auto-advance behavior on a player.
 *
 * @param  {Player} player
 *         the current player
 *
 * @param  {number} delay
 *         The number of seconds to wait before each auto-advance.
 *
 * @return {undefined}
 *         Used to short circuit function logic
 */
var setup$1 = function setup(player, delay) {
  reset(player);

  // Before queuing up new auto-advance behavior, check if `seconds` was
  // called with a valid value.
  if (!validSeconds(delay)) {
    player.playlist.autoadvance_.delay = null;
    return;
  }

  player.playlist.autoadvance_.delay = delay;

  player.playlist.autoadvance_.trigger = function () {

    // This calls setup again, which will reset the existing auto-advance and
    // set up another auto-advance for the next "ended" event.
    var cancelOnPlay = function cancelOnPlay() {
      return setup(player, delay);
    };

    // If there is a "play" event while we're waiting for an auto-advance,
    // we need to cancel the auto-advance. This could mean the user seeked
    // back into the content or restarted the content. This is reproducible
    // with an auto-advance > 0.
    player.one('play', cancelOnPlay);

    player.playlist.autoadvance_.timeout = player.setTimeout(function () {
      reset(player);
      player.off('play', cancelOnPlay);
      player.playlist.next();
    }, delay * 1000);
  };

  player.one('ended', player.playlist.autoadvance_.trigger);
};

/**
 * Removes all remote text tracks from a player.
 *
 * @param  {Player} player
 *         The player to clear tracks on
 */
var clearTracks = function clearTracks(player) {
  var tracks = player.remoteTextTracks();
  var i = tracks && tracks.length || 0;

  // This uses a `while` loop rather than `forEach` because the
  // `TextTrackList` object is a live DOM list (not an array).
  while (i--) {
    player.removeRemoteTextTrack(tracks[i]);
  }
};

/**
 * Plays an item on a player's playlist.
 *
 * @param  {Player} player
 *         The player to play the item on
 *
 * @param  {Object} item
 *         A source from the playlist.
 *
 * @return {Player}
 *         The player that is now playing the item
 */
var playItem = function playItem(player, item) {
  var replay = !player.paused() || player.ended();

  player.trigger('beforeplaylistitem', item);
  player.poster(item.poster || '');
  player.src(item.sources);
  clearTracks(player);

  player.ready(function () {
    (item.textTracks || []).forEach(player.addRemoteTextTrack.bind(player));
    player.trigger('playlistitem', item);

    if (replay) {
      player.play();
    }

    setup$1(player, player.playlist.autoadvance_.delay);
  });

  return player;
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

/**
 * Given two sources, check to see whether the two sources are equal.
 * If both source urls have a protocol, the protocols must match, otherwise, protocols
 * are ignored.
 *
 * @private
 * @param {string|Object} source1
 *        The first source
 *
 * @param {string|Object} source2
 *        The second source
 *
 * @return {boolean}
 *         The result
 */
var sourceEquals = function sourceEquals(source1, source2) {
  var src1 = source1;
  var src2 = source2;

  if ((typeof source1 === 'undefined' ? 'undefined' : _typeof(source1)) === 'object') {
    src1 = source1.src;
  }
  if ((typeof source2 === 'undefined' ? 'undefined' : _typeof(source2)) === 'object') {
    src2 = source2.src;
  }

  if (/^\/\//.test(src1)) {
    src2 = src2.slice(src2.indexOf('//'));
  }
  if (/^\/\//.test(src2)) {
    src1 = src1.slice(src1.indexOf('//'));
  }

  return src1 === src2;
};

/**
 * Look through an array of playlist items for a specific `source`;
 * checking both the value of elements and the value of their `src`
 * property.
 *
 * @private
 * @param   {Array} arr
 *          An array of playlist items to look through
 *
 * @param   {string} src
 *          The source to look for
 *
 * @return  {number}
 *          The index of that source or -1
 */
var indexInSources = function indexInSources(arr, src) {
  for (var i = 0; i < arr.length; i++) {
    var sources = arr[i].sources;

    if (Array.isArray(sources)) {
      for (var j = 0; j < sources.length; j++) {
        var source = sources[j];

        if (source && sourceEquals(source, src)) {
          return i;
        }
      }
    }
  }

  return -1;
};

/**
 * Factory function for creating new playlist implementation on the given player.
 *
 * API summary:
 *
 * playlist(['a', 'b', 'c']) // setter
 * playlist() // getter
 * playlist.currentItem() // getter, 0
 * playlist.currentItem(1) // setter, 1
 * playlist.next() // 'c'
 * playlist.previous() // 'b'
 * playlist.first() // 'a'
 * playlist.last() // 'c'
 * playlist.autoadvance(5) // 5 second delay
 * playlist.autoadvance() // cancel autoadvance
 *
 * @param  {Player} player
 *         The current player
 *
 * @param  {Array=} initialList
 *         If given, an initial list of sources with which to populate
 *         the playlist.
 *
 * @param  {number=}  initialIndex
 *         If given, the index of the item in the list that should
 *         be loaded first. If -1, no video is loaded. If omitted, The
 *         the first video is loaded.
 *
 * @return {Function}
 *         Returns the playlist function specific to the given player.
 */
function factory(player, initialList) {
  var initialIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var list = Array.isArray(initialList) ? initialList.slice() : [];

  /**
   * Get/set the playlist for a player.
   *
   * This function is added as an own property of the player and has its
   * own methods which can be called to manipulate the internal state.
   *
   * @param  {Array} [newList]
   *         If given, a new list of sources with which to populate the
   *         playlist. Without this, the function acts as a getter.
   *
   * @param  {number}  [newIndex]
   *         If given, the index of the item in the list that should
   *         be loaded first. If -1, no video is loaded. If omitted, The
   *         the first video is loaded.
   *
   * @return {Array}
   *         The playlist
   */
  var playlist = player.playlist = function (newList) {
    var newIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    if (Array.isArray(newList)) {
      list = newList.slice();
      if (newIndex !== -1) {
        playlist.currentItem(newIndex);
      }
      player.setTimeout(function () {
        return player.trigger('playlistchange');
      }, 0);
    }

    // Always return a shallow clone of the playlist list.
    return list.slice();
  };

  // On a new source, if there is no current item, disable auto-advance.
  player.on('loadstart', function () {
    if (playlist.currentItem() === -1) {
      reset(player);
    }
  });

  playlist.currentIndex_ = -1;
  playlist.player_ = player;
  playlist.autoadvance_ = {};
  playlist.repeat_ = false;

  /**
   * Get or set the current item in the playlist.
   *
   * @param  {number} [index]
   *         If given as a valid value, plays the playlist item at that index.
   *
   * @return {number}
   *         The current item index.
   */
  playlist.currentItem = function (index) {
    if (typeof index === 'number' && playlist.currentIndex_ !== index && index >= 0 && index < list.length) {
      playlist.currentIndex_ = index;
      playItem(playlist.player_, list[playlist.currentIndex_]);
    } else {
      playlist.currentIndex_ = playlist.indexOf(playlist.player_.currentSrc() || '');
    }

    return playlist.currentIndex_;
  };

  /**
   * Checks if the playlist contains a value.
   *
   * @param  {string|Object|Array} value
   *         The value to check
   *
   * @return {boolean}
   *         The result
   */
  playlist.contains = function (value) {
    return playlist.indexOf(value) !== -1;
  };

  /**
   * Gets the index of a value in the playlist or -1 if not found.
   *
   * @param  {string|Object|Array} value
   *         The value to find the index of
   *
   * @return {number}
   *         The index or -1
   */
  playlist.indexOf = function (value) {
    if (typeof value === 'string') {
      return indexInSources(list, value);
    }

    var sources = Array.isArray(value) ? value : value.sources;

    for (var i = 0; i < sources.length; i++) {
      var source = sources[i];

      if (typeof source === 'string') {
        return indexInSources(list, source);
      } else if (source.src) {
        return indexInSources(list, source.src);
      }
    }

    return -1;
  };

  /**
   * Get the index of the current item in the playlist. This is identical to
   * calling `currentItem()` with no arguments.
   *
   * @return {number}
   *         The current item index.
   */
  playlist.currentIndex = function () {
    return playlist.currentItem();
  };

  /**
   * Get the index of the last item in the playlist.
   *
   * @return {number}
   *         The index of the last item in the playlist or -1 if there are no
   *         items.
   */
  playlist.lastIndex = function () {
    return list.length - 1;
  };

  /**
   * Get the index of the next item in the playlist.
   *
   * @return {number}
   *         The index of the next item in the playlist or -1 if there is no
   *         current item.
   */
  playlist.nextIndex = function () {
    var current = playlist.currentItem();

    if (current === -1) {
      return -1;
    }

    var lastIndex = playlist.lastIndex();

    // When repeating, loop back to the beginning on the last item.
    if (playlist.repeat_ && current === lastIndex) {
      return 0;
    }

    // Don't go past the end of the playlist.
    return Math.min(current + 1, lastIndex);
  };

  /**
   * Get the index of the previous item in the playlist.
   *
   * @return {number}
   *         The index of the previous item in the playlist or -1 if there is
   *         no current item.
   */
  playlist.previousIndex = function () {
    var current = playlist.currentItem();

    if (current === -1) {
      return -1;
    }

    // When repeating, loop back to the end of the playlist.
    if (playlist.repeat_ && current === 0) {
      return playlist.lastIndex();
    }

    // Don't go past the beginning of the playlist.
    return Math.max(current - 1, 0);
  };

  /**
   * Plays the first item in the playlist.
   *
   * @return {Object|undefined}
   *         Returns undefined and has no side effects if the list is empty.
   */
  playlist.first = function () {
    if (list.length) {
      return list[playlist.currentItem(0)];
    }

    playlist.currentIndex_ = -1;
  };

  /**
   * Plays the last item in the playlist.
   *
   * @return {Object|undefined}
   *         Returns undefined and has no side effects if the list is empty.
   */
  playlist.last = function () {
    if (list.length) {
      return list[playlist.currentItem(playlist.lastIndex())];
    }

    playlist.currentIndex_ = -1;
  };

  /**
   * Plays the next item in the playlist.
   *
   * @return {Object|undefined}
   *         Returns undefined and has no side effects if on last item.
   */
  playlist.next = function () {
    var index = playlist.nextIndex();

    if (index !== playlist.currentIndex_) {
      return list[playlist.currentItem(index)];
    }
  };

  /**
   * Plays the previous item in the playlist.
   *
   * @return {Object|undefined}
   *         Returns undefined and has no side effects if on first item.
   */
  playlist.previous = function () {
    var index = playlist.previousIndex();

    if (index !== playlist.currentIndex_) {
      return list[playlist.currentItem(index)];
    }
  };

  /**
   * Set up auto-advance on the playlist.
   *
   * @param  {number} [delay]
   *         The number of seconds to wait before each auto-advance.
   */
  playlist.autoadvance = function (delay) {
    setup$1(playlist.player_, delay);
  };

  /**
   * Sets `repeat` option, which makes the "next" video of the last video in
   * the playlist be the first video in the playlist.
   *
   * @param  {boolean} [val]
   *         The value to set repeat to
   *
   * @return {boolean}
   *         The current value of repeat
   */
  playlist.repeat = function (val) {
    if (val === undefined) {
      return playlist.repeat_;
    }

    if (typeof val !== 'boolean') {
      videojs.log.error('videojs-playlist: Invalid value for repeat', val);
      return;
    }

    playlist.repeat_ = !!val;
    return playlist.repeat_;
  };

  /**
   * Sorts the playlist array.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort}
   * @fires playlistsorted
   *
   * @param {Function} compare
   *        A comparator function as per the native Array method.
   */
  playlist.sort = function (compare) {

    // Bail if the array is empty.
    if (!list.length) {
      return;
    }

    list.sort(compare);

    /**
     * Triggered after the playlist is sorted internally.
     *
     * @event playlistsorted
     * @type {Object}
     */
    player.trigger('playlistsorted');
  };

  /**
   * Reverses the playlist array.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse}
   * @fires playlistsorted
   */
  playlist.reverse = function () {

    // Bail if the array is empty.
    if (!list.length) {
      return;
    }

    list.reverse();

    /**
     * Triggered after the playlist is sorted internally.
     *
     * @event playlistsorted
     * @type {Object}
     */
    player.trigger('playlistsorted');
  };

  /**
   * Shuffle the contents of the list randomly.
   *
   * @see {@link https://github.com/lodash/lodash/blob/40e096b6d5291a025e365a0f4c010d9a0efb9a69/shuffle.js}
   * @fires playlistsorted
   */
  playlist.shuffle = function () {
    var index = -1;
    var length = list.length;

    // Bail if the array is empty.
    if (!length) {
      return;
    }

    var lastIndex = length - 1;

    while (++index < length) {
      var rand = index + Math.floor(Math.random() * (lastIndex - index + 1));
      var value = list[rand];

      list[rand] = list[index];
      list[index] = value;
    }

    /**
     * Triggered after the playlist is sorted internally.
     *
     * @event playlistsorted
     * @type {Object}
     */
    player.trigger('playlistsorted');
  };

  playlist.currentItem(initialIndex);

  return playlist;
}

// Video.js 5/6 cross-compatible.
var registerPlugin = videojs.registerPlugin || videojs.plugin;

/**
 * The video.js playlist plugin. Invokes the playlist-maker to create a
 * playlist function on the specific player.
 *
 * @param {Array} list
 *        a list of sources
 *
 * @param {number} item
 *        The index to start at
 */
var plugin = function plugin(list, item) {
  factory(this, list, item);
};

registerPlugin('playlist', plugin);

var version = "3.4.0";

var asyncGenerator$1 = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};











var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

// support VJS5 & VJS6 at the same time
var dom$1 = videojs.dom || videojs;
var registerPlugin$1 = videojs.registerPlugin || videojs.plugin;

// Array#indexOf analog for IE8
var indexOf = function indexOf(array, target) {
  for (var i = 0, length = array.length; i < length; i++) {
    if (array[i] === target) {
      return i;
    }
  }
  return -1;
};

// see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/css/pointerevents.js
var supportsCssPointerEvents = function () {
  var element = document_1.createElement('x');

  element.style.cssText = 'pointer-events:auto';
  return element.style.pointerEvents === 'auto';
}();

var defaults = {
  className: 'vjs-playlist',
  playOnSelect: false,
  supportsCssPointerEvents: supportsCssPointerEvents
};

// we don't add `vjs-playlist-now-playing` in addSelectedClass
// so it won't conflict with `vjs-icon-play
// since it'll get added when we mouse out
var addSelectedClass = function addSelectedClass(el) {
  el.addClass('vjs-selected');
};
var removeSelectedClass = function removeSelectedClass(el) {
  el.removeClass('vjs-selected');

  if (el.thumbnail) {
    dom$1.removeClass(el.thumbnail, 'vjs-playlist-now-playing');
  }
};

var upNext = function upNext(el) {
  el.addClass('vjs-up-next');
};
var notUpNext = function notUpNext(el) {
  el.removeClass('vjs-up-next');
};

var createThumbnail = function createThumbnail(thumbnail) {
  if (!thumbnail) {
    var placeholder = document_1.createElement('div');

    placeholder.className = 'vjs-playlist-thumbnail vjs-playlist-thumbnail-placeholder';
    return placeholder;
  }

  var picture = document_1.createElement('picture');

  picture.className = 'vjs-playlist-thumbnail';

  if (typeof thumbnail === 'string') {
    // simple thumbnails
    var img = document_1.createElement('img');

    img.src = thumbnail;
    img.alt = '';
    picture.appendChild(img);
  } else {
    // responsive thumbnails

    // additional variations of a <picture> are specified as
    // <source> elements
    for (var i = 0; i < thumbnail.length - 1; i++) {
      var _variant = thumbnail[i];
      var source = document_1.createElement('source');

      // transfer the properties of each variant onto a <source>
      for (var prop in _variant) {
        source[prop] = _variant[prop];
      }
      picture.appendChild(source);
    }

    // the default version of a <picture> is specified by an <img>
    var variant = thumbnail[thumbnail.length - 1];
    var _img = document_1.createElement('img');

    _img.alt = '';
    for (var _prop in variant) {
      _img[_prop] = variant[_prop];
    }
    picture.appendChild(_img);
  }
  return picture;
};

var Component = videojs.getComponent('Component');

var PlaylistMenuItem = function (_Component) {
  inherits(PlaylistMenuItem, _Component);

  function PlaylistMenuItem(player, playlistItem, settings) {
    classCallCheck(this, PlaylistMenuItem);

    if (!playlistItem.item) {
      throw new Error('Cannot construct a PlaylistMenuItem without an item option');
    }

    var _this = possibleConstructorReturn(this, _Component.call(this, player, playlistItem));

    _this.item = playlistItem.item;

    _this.playOnSelect = settings.playOnSelect;

    _this.emitTapEvents();

    _this.on(['click', 'tap'], _this.switchPlaylistItem_);
    _this.on('keydown', _this.handleKeyDown_);

    return _this;
  }

  PlaylistMenuItem.prototype.handleKeyDown_ = function handleKeyDown_(event) {
    // keycode 13 is <Enter>
    // keycode 32 is <Space>
    if (event.which === 13 || event.which === 32) {
      this.switchPlaylistItem_();
    }
  };

  PlaylistMenuItem.prototype.switchPlaylistItem_ = function switchPlaylistItem_(event) {
    this.player_.playlist.currentItem(indexOf(this.player_.playlist(), this.item));
    if (this.playOnSelect) {
      this.player_.play();
    }
  };

  PlaylistMenuItem.prototype.createEl = function createEl() {
    var li = document_1.createElement('li');
    var item = this.options_.item;

    li.className = 'vjs-playlist-item';
    li.setAttribute('tabIndex', 0);

    // Thumbnail image
    this.thumbnail = createThumbnail(item.thumbnail);
    li.appendChild(this.thumbnail);

    // Duration
    if (item.duration) {
      var duration = document_1.createElement('time');
      var time = videojs.formatTime(item.duration);

      duration.className = 'vjs-playlist-duration';
      duration.setAttribute('datetime', 'PT0H0M' + item.duration + 'S');
      duration.appendChild(document_1.createTextNode(time));
      li.appendChild(duration);
    }

    // Now playing
    var nowPlayingEl = document_1.createElement('span');
    var nowPlayingText = this.localize('Now Playing');

    nowPlayingEl.className = 'vjs-playlist-now-playing-text';
    nowPlayingEl.appendChild(document_1.createTextNode(nowPlayingText));
    nowPlayingEl.setAttribute('title', nowPlayingText);
    this.thumbnail.appendChild(nowPlayingEl);

    // Title container contains title and "up next"
    var titleContainerEl = document_1.createElement('div');

    titleContainerEl.className = 'vjs-playlist-title-container';
    this.thumbnail.appendChild(titleContainerEl);

    // Up next
    var upNextEl = document_1.createElement('span');
    var upNextText = this.localize('Up Next');

    upNextEl.className = 'vjs-up-next-text';
    upNextEl.appendChild(document_1.createTextNode(upNextText));
    upNextEl.setAttribute('title', upNextText);
    titleContainerEl.appendChild(upNextEl);

    // Video title
    var titleEl = document_1.createElement('cite');
    var titleText = item.name || this.localize('Untitled Video');

    titleEl.className = 'vjs-playlist-name';
    titleEl.appendChild(document_1.createTextNode(titleText));
    titleEl.setAttribute('title', titleText);
    titleContainerEl.appendChild(titleEl);

    return li;
  };

  return PlaylistMenuItem;
}(Component);

var PlaylistMenu = function (_Component2) {
  inherits(PlaylistMenu, _Component2);

  function PlaylistMenu(player, options) {
    classCallCheck(this, PlaylistMenu);

    if (!player.playlist) {
      throw new Error('videojs-playlist is required for the playlist component');
    }

    var _this2 = possibleConstructorReturn(this, _Component2.call(this, player, options));

    _this2.items = [];

    if (options.horizontal) {
      _this2.addClass('vjs-playlist-horizontal');
    } else {
      _this2.addClass('vjs-playlist-vertical');
    }

    // If CSS pointer events aren't supported, we have to prevent
    // clicking on playlist items during ads with slightly more
    // invasive techniques. Details in the stylesheet.
    if (options.supportsCssPointerEvents) {
      _this2.addClass('vjs-csspointerevents');
    }

    _this2.createPlaylist_();

    if (!videojs.browser.TOUCH_ENABLED) {
      _this2.addClass('vjs-mouse');
    }

    player.on(['loadstart', 'playlistchange', 'playlistsorted'], function (event) {
      _this2.update();
    });

    // Keep track of whether an ad is playing so that the menu
    // appearance can be adapted appropriately
    player.on('adstart', function () {
      _this2.addClass('vjs-ad-playing');
    });

    player.on('adend', function () {
      _this2.removeClass('vjs-ad-playing');
    });
    return _this2;
  }

  PlaylistMenu.prototype.createEl = function createEl() {
    return dom$1.createEl('div', { className: this.options_.className });
  };

  PlaylistMenu.prototype.createPlaylist_ = function createPlaylist_() {
    var playlist = this.player_.playlist() || [];
    var list = this.el_.querySelector('.vjs-playlist-item-list');
    var overlay = this.el_.querySelector('.vjs-playlist-ad-overlay');

    if (!list) {
      list = document_1.createElement('ol');
      list.className = 'vjs-playlist-item-list';
      this.el_.appendChild(list);
    }

    // remove any existing items
    for (var i = 0; i < this.items.length; i++) {
      list.removeChild(this.items[i].el_);
    }
    this.items.length = 0;

    // create new items
    for (var _i = 0; _i < playlist.length; _i++) {
      var item = new PlaylistMenuItem(this.player_, {
        item: playlist[_i]
      }, this.options_);

      this.items.push(item);
      list.appendChild(item.el_);
    }

    // Inject the ad overlay. IE<11 doesn't support "pointer-events:
    // none" so we use this element to block clicks during ad
    // playback.
    if (!overlay) {
      overlay = document_1.createElement('li');
      overlay.className = 'vjs-playlist-ad-overlay';
      list.appendChild(overlay);
    } else {
      // Move overlay to end of list
      list.appendChild(overlay);
    }

    // select the current playlist item
    var selectedIndex = this.player_.playlist.currentItem();

    if (this.items.length && selectedIndex >= 0) {
      addSelectedClass(this.items[selectedIndex]);

      var thumbnail = this.items[selectedIndex].$('.vjs-playlist-thumbnail');

      if (thumbnail) {
        dom$1.addClass(thumbnail, 'vjs-playlist-now-playing');
      }
    }
  };

  PlaylistMenu.prototype.update = function update() {
    // replace the playlist items being displayed, if necessary
    var playlist = this.player_.playlist();

    if (this.items.length !== playlist.length) {
      // if the menu is currently empty or the state is obviously out
      // of date, rebuild everything.
      this.createPlaylist_();
      return;
    }

    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].item !== playlist[i]) {
        // if any of the playlist items have changed, rebuild the
        // entire playlist
        this.createPlaylist_();
        return;
      }
    }

    // the playlist itself is unchanged so just update the selection
    var currentItem = this.player_.playlist.currentItem();

    for (var _i2 = 0; _i2 < this.items.length; _i2++) {
      var item = this.items[_i2];

      if (_i2 === currentItem) {
        addSelectedClass(item);
        if (document_1.activeElement !== item.el()) {
          dom$1.addClass(item.thumbnail, 'vjs-playlist-now-playing');
        }
        notUpNext(item);
      } else if (_i2 === currentItem + 1) {
        removeSelectedClass(item);
        upNext(item);
      } else {
        removeSelectedClass(item);
        notUpNext(item);
      }
    }
  };

  return PlaylistMenu;
}(Component);

/**
 * Returns a boolean indicating whether an element has child elements.
 *
 * Note that this is distinct from whether it has child _nodes_.
 *
 * @param  {HTMLElement} el
 *         A DOM element.
 *
 * @return {boolean}
 *         Whether the element has child elements.
 */


var hasChildEls = function hasChildEls(el) {
  for (var i = 0; i < el.childNodes.length; i++) {
    if (dom$1.isEl(el.childNodes[i])) {
      return true;
    }
  }
  return false;
};

/**
 * Finds the first empty root element.
 *
 * @param  {string} className
 *         An HTML class name to search for.
 *
 * @return {HTMLElement}
 *         A DOM element to use as the root for a playlist.
 */
var findRoot = function findRoot(className) {
  var all = document_1.querySelectorAll('.' + className);
  var el = void 0;

  for (var i = 0; i < all.length; i++) {
    if (!hasChildEls(all[i])) {
      el = all[i];
      break;
    }
  }

  return el;
};

/**
 * Initialize the plugin on a player.
 *
 * @param  {Object} [options]
 *         An options object.
 *
 * @param  {HTMLElement} [options.el]
 *         A DOM element to use as a root node for the playlist.
 *
 * @param  {string} [options.className]
 *         An HTML class name to use to find a root node for the playlist.
 *
 * @param  {boolean} [options.playOnSelect = false]
 *         If true, will attempt to begin playback upon selecting a new
 *         playlist item in the UI.
 */
var playlistUi = function playlistUi(options) {
  var player = this;

  if (!player.playlist) {
    throw new Error('videojs-playlist plugin is required by the videojs-playlist-ui plugin');
  }

  if (dom$1.isEl(options)) {
    videojs.log.warn('videojs-playlist-ui: Passing an element directly to playlistUi() is deprecated, use the "el" option instead!');
    options = { el: options };
  }

  options = videojs.mergeOptions(defaults, options);

  // If the player is already using this plugin, remove the pre-existing
  // PlaylistMenu, but retain the element and its location in the DOM because
  // it will be re-used.
  if (player.playlistMenu) {
    var el = player.playlistMenu.el();

    // Catch cases where the menu may have been disposed elsewhere or the
    // element removed from the DOM.
    if (el) {
      var parentNode = el.parentNode;
      var nextSibling = el.nextSibling;

      // Disposing the menu will remove `el` from the DOM, but we need to
      // empty it ourselves to be sure.
      player.playlistMenu.dispose();
      dom$1.emptyEl(el);

      // Put the element back in its place.
      if (nextSibling) {
        parentNode.insertBefore(el, nextSibling);
      } else {
        parentNode.appendChild(el);
      }

      options.el = el;
    }
  }

  if (!dom$1.isEl(options.el)) {
    options.el = findRoot(options.className);
  }

  player.playlistMenu = new PlaylistMenu(player, options);
};

// register components
videojs.registerComponent('PlaylistMenu', PlaylistMenu);
videojs.registerComponent('PlaylistMenuItem', PlaylistMenuItem);

// register the plugin
registerPlugin$1('playlistUi', playlistUi);

playlistUi.VERSION = version;

var playlist = [{
  name: 'Movie 1',
  description: 'Movie 1 description',
  duration: 100,
  sources: [{
    src: '//example.com/movie1.mp4',
    type: 'video/mp4'
  }]
}, {
  sources: [{
    src: '//example.com/movie2.mp4',
    type: 'video/mp4'
  }],
  thumbnail: '//example.com/movie2.jpg'
}];

var resolveUrl = function resolveUrl(url) {
  var a = document_1.createElement('a');

  a.href = url;
  return a.href;
};

var dom = videojs.dom || videojs;
var Html5 = videojs.getTech('Html5');

QUnit.test('the environment is sane', function (assert) {
  assert.ok(true, 'everything is swell');
});

function setup() {
  this.oldVideojsBrowser = videojs.browser;
  videojs.browser = videojs.mergeOptions({}, videojs.browser);

  this.fixture = document_1.querySelector('#qunit-fixture');

  // force HTML support so the tests run in a reasonable
  // environment under phantomjs
  this.realIsHtmlSupported = Html5.isSupported;
  Html5.isSupported = function () {
    return true;
  };

  // create a video element
  var video = document_1.createElement('video');

  this.fixture.appendChild(video);

  // create a video.js player
  this.player = videojs(video);

  // Create two playlist container elements.
  this.fixture.appendChild(dom.createEl('div', { className: 'vjs-playlist' }));
  this.fixture.appendChild(dom.createEl('div', { className: 'vjs-playlist' }));
}

function teardown() {
  videojs.browser = this.oldVideojsBrowser;
  Html5.isSupported = this.realIsHtmlSupported;
  this.player.dispose();
  this.player = null;
  dom.emptyEl(this.fixture);
}

QUnit.module('videojs-playlist-ui', { setup: setup, teardown: teardown });

QUnit.test('registers itself', function (assert) {
  assert.ok(this.player.playlistUi, 'registered the plugin');
});

QUnit.test('errors if used without the playlist plugin', function (assert) {
  assert.throws(function () {
    this.player.playlist = null;
    this.player.playlistUi();
  }, 'threw on init');
});

QUnit.test('is empty if the playlist plugin isn\'t initialized', function (assert) {
  this.player.playlistUi();

  var items = this.fixture.querySelectorAll('.vjs-playlist-item');

  assert.ok(this.fixture.querySelector('.vjs-playlist'), 'created the menu');
  assert.strictEqual(items.length, 0, 'displayed no items');
});

QUnit.test('can be initialized with an element (deprecated form)', function (assert) {
  var elem = dom.createEl('div');

  this.player.playlist(playlist);
  this.player.playlistUi(elem);

  assert.strictEqual(elem.querySelectorAll('li.vjs-playlist-item').length, playlist.length, 'created an element for each playlist item');
});

QUnit.test('can be initialized with an element', function (assert) {
  var elem = dom.createEl('div');

  this.player.playlist(playlist);
  this.player.playlistUi({ el: elem });

  assert.strictEqual(elem.querySelectorAll('li.vjs-playlist-item').length, playlist.length, 'created an element for each playlist item');
});

QUnit.test('can look for an element with the class "vjs-playlist" that is not already in use', function (assert) {
  var firstEl = this.fixture.querySelectorAll('.vjs-playlist')[0];
  var secondEl = this.fixture.querySelectorAll('.vjs-playlist')[1];

  // Give the firstEl a child, so the plugin thinks it is in use and moves on
  // to the next one.
  firstEl.appendChild(dom.createEl('div'));

  this.player.playlist(playlist);
  this.player.playlistUi();

  assert.strictEqual(this.player.playlistMenu.el(), secondEl, 'used the first matching/empty element');
  assert.strictEqual(secondEl.querySelectorAll('li.vjs-playlist-item').length, playlist.length, 'found an element for each playlist item');
});

QUnit.test('can look for an element with a custom class that is not already in use', function (assert) {
  var firstEl = dom.createEl('div', { className: 'super-playlist' });
  var secondEl = dom.createEl('div', { className: 'super-playlist' });

  // Give the firstEl a child, so the plugin thinks it is in use and moves on
  // to the next one.
  firstEl.appendChild(dom.createEl('div'));

  this.fixture.appendChild(firstEl);
  this.fixture.appendChild(secondEl);

  this.player.playlist(playlist);
  this.player.playlistUi({
    className: 'super-playlist'
  });

  assert.strictEqual(this.player.playlistMenu.el(), secondEl, 'used the first matching/empty element');
  assert.strictEqual(this.fixture.querySelectorAll('li.vjs-playlist-item').length, playlist.length, 'created an element for each playlist item');
});

QUnit.test('specializes the class name if touch input is absent', function (assert) {
  videojs.browser.TOUCH_ENABLED = false;

  this.player.playlist(playlist);
  this.player.playlistUi();

  assert.ok(this.player.playlistMenu.hasClass('vjs-mouse'), 'marked the playlist menu');
});

QUnit.test('can be re-initialized without doubling the contents of the list', function (assert) {
  var el = this.fixture.querySelectorAll('.vjs-playlist')[0];

  this.player.playlist(playlist);
  this.player.playlistUi();
  this.player.playlistUi();
  this.player.playlistUi();

  assert.strictEqual(this.player.playlistMenu.el(), el, 'used the first matching/empty element');
  assert.strictEqual(el.querySelectorAll('li.vjs-playlist-item').length, playlist.length, 'found an element for each playlist item');
});

QUnit.module('videojs-playlist-ui: Components', { setup: setup, teardown: teardown });

// --------------------
// Creation and Updates
// --------------------

QUnit.test('includes the video name if provided', function (assert) {
  this.player.playlist(playlist);
  this.player.playlistUi();

  var items = this.fixture.querySelectorAll('.vjs-playlist-item');

  assert.strictEqual(items[0].querySelector('.vjs-playlist-name').textContent, playlist[0].name, 'wrote the name');
  assert.strictEqual(items[1].querySelector('.vjs-playlist-name').textContent, 'Untitled Video', 'wrote a placeholder for the name');
});

QUnit.test('outputs a <picture> for simple thumbnails', function (assert) {
  this.player.playlist(playlist);
  this.player.playlistUi();

  var pictures = this.fixture.querySelectorAll('.vjs-playlist-item picture');

  assert.strictEqual(pictures.length, 1, 'output one picture');
  var imgs = pictures[0].querySelectorAll('img');

  assert.strictEqual(imgs.length, 1, 'output one img');
  assert.strictEqual(imgs[0].src, window_1.location.protocol + playlist[1].thumbnail, 'set the src attribute');
});

QUnit.test('outputs a <picture> for responsive thumbnails', function (assert) {
  var playlistOverride = [{
    sources: [{
      src: '//example.com/movie.mp4',
      type: 'video/mp4'
    }],
    thumbnail: [{
      srcset: '/test/example/oceans.jpg',
      type: 'image/jpeg',
      media: '(min-width: 400px;)'
    }, {
      src: '/test/example/oceans-low.jpg'
    }]
  }];

  this.player.playlist(playlistOverride);
  this.player.playlistUi();

  var sources = this.fixture.querySelectorAll('.vjs-playlist-item picture source');
  var imgs = this.fixture.querySelectorAll('.vjs-playlist-item picture img');

  assert.strictEqual(sources.length, 1, 'output one source');
  assert.strictEqual(sources[0].srcset, playlistOverride[0].thumbnail[0].srcset, 'wrote the srcset attribute');
  assert.strictEqual(sources[0].type, playlistOverride[0].thumbnail[0].type, 'wrote the type attribute');
  assert.strictEqual(sources[0].media, playlistOverride[0].thumbnail[0].media, 'wrote the type attribute');
  assert.strictEqual(imgs.length, 1, 'output one img');
  assert.strictEqual(imgs[0].src, resolveUrl(playlistOverride[0].thumbnail[1].src), 'output the img src attribute');
});

QUnit.test('outputs a placeholder for items without thumbnails', function (assert) {
  this.player.playlist(playlist);
  this.player.playlistUi();

  var thumbnails = this.fixture.querySelectorAll('.vjs-playlist-item .vjs-playlist-thumbnail');

  assert.strictEqual(thumbnails.length, playlist.length, 'output two thumbnails');
  assert.strictEqual(thumbnails[0].nodeName.toLowerCase(), 'div', 'the second is a placeholder');
});

QUnit.test('includes the duration if one is provided', function (assert) {
  this.player.playlist(playlist);
  this.player.playlistUi();

  var durations = this.fixture.querySelectorAll('.vjs-playlist-item .vjs-playlist-duration');

  assert.strictEqual(durations.length, 1, 'skipped the item without a duration');
  assert.strictEqual(durations[0].textContent, '1:40', 'wrote the duration');
  assert.strictEqual(durations[0].getAttribute('datetime'), 'PT0H0M' + playlist[0].duration + 'S', 'wrote a machine-readable datetime');
});

QUnit.test('marks the selected playlist item on startup', function (assert) {
  this.player.playlist(playlist);
  this.player.currentSrc = function () {
    return playlist[0].sources[0].src;
  };
  this.player.playlistUi();

  var selectedItems = this.fixture.querySelectorAll('.vjs-playlist-item.vjs-selected');

  assert.strictEqual(selectedItems.length, 1, 'marked one playlist item');
  assert.strictEqual(selectedItems[0].querySelector('.vjs-playlist-name').textContent, playlist[0].name, 'marked the first playlist item');
});

QUnit.test('updates the selected playlist item on loadstart', function (assert) {
  this.player.playlist(playlist);
  this.player.playlistUi();

  this.player.playlist.currentItem(1);
  this.player.currentSrc = function () {
    return playlist[1].sources[0].src;
  };
  this.player.trigger('loadstart');

  var selectedItems = this.fixture.querySelectorAll('.vjs-playlist-item.vjs-selected');

  assert.strictEqual(this.fixture.querySelectorAll('.vjs-playlist-item').length, playlist.length, 'displayed the correct number of items');
  assert.strictEqual(selectedItems.length, 1, 'marked one playlist item');
  assert.strictEqual(selectedItems[0].querySelector('img').src, resolveUrl(playlist[1].thumbnail), 'marked the second playlist item');
});

QUnit.test('selects no item if the playlist is not in use', function (assert) {
  this.player.playlist(playlist);
  this.player.playlist.currentItem = function () {
    return -1;
  };
  this.player.playlistUi();

  this.player.trigger('loadstart');

  assert.strictEqual(this.fixture.querySelectorAll('.vjs-playlist-item.vjs-selected').length, 0, 'no items selected');
});

QUnit.test('updates on "playlistchange", different lengths', function (assert) {
  this.player.playlist([]);
  this.player.playlistUi();

  var items = this.fixture.querySelectorAll('.vjs-playlist-item');

  assert.strictEqual(items.length, 0, 'no items initially');

  this.player.playlist(playlist);
  this.player.trigger('playlistchange');
  items = this.fixture.querySelectorAll('.vjs-playlist-item');
  assert.strictEqual(items.length, playlist.length, 'updated with the new items');
});

QUnit.test('updates on "playlistchange", equal lengths', function (assert) {
  this.player.playlist([{ sources: [] }, { sources: [] }]);
  this.player.playlistUi();

  var items = this.fixture.querySelectorAll('.vjs-playlist-item');

  assert.strictEqual(items.length, 2, 'two items initially');

  this.player.playlist(playlist);
  this.player.trigger('playlistchange');
  items = this.fixture.querySelectorAll('.vjs-playlist-item');
  assert.strictEqual(items.length, playlist.length, 'updated with the new items');
  assert.strictEqual(this.player.playlistMenu.items[0].item, playlist[0], 'we have updated items');
  assert.strictEqual(this.player.playlistMenu.items[1].item, playlist[1], 'we have updated items');
});

QUnit.test('updates on "playlistchange", update selection', function (assert) {
  this.player.playlist(playlist);
  this.player.currentSrc = function () {
    return playlist[0].sources[0].src;
  };
  this.player.playlistUi();

  var items = this.fixture.querySelectorAll('.vjs-playlist-item');

  assert.strictEqual(items.length, 2, 'two items initially');

  assert.ok(/vjs-selected/.test(items[0].getAttribute('class')), 'first item is selected by default');
  this.player.playlist.currentItem(1);
  this.player.currentSrc = function () {
    return playlist[1].sources[0].src;
  };

  this.player.trigger('playlistchange');
  items = this.fixture.querySelectorAll('.vjs-playlist-item');
  assert.strictEqual(items.length, playlist.length, 'updated with the new items');
  assert.ok(/vjs-selected/.test(items[1].getAttribute('class')), 'second item is selected after update');
  assert.ok(!/vjs-selected/.test(items[0].getAttribute('class')), 'first item is not selected after update');
});

QUnit.test('updates on "playlistsorted", different lengths', function (assert) {
  this.player.playlist([]);
  this.player.playlistUi();

  var items = this.fixture.querySelectorAll('.vjs-playlist-item');

  assert.strictEqual(items.length, 0, 'no items initially');

  this.player.playlist(playlist);
  this.player.trigger('playlistsorted');
  items = this.fixture.querySelectorAll('.vjs-playlist-item');
  assert.strictEqual(items.length, playlist.length, 'updated with the new items');
});

QUnit.test('updates on "playlistsorted", equal lengths', function (assert) {
  this.player.playlist([{ sources: [] }, { sources: [] }]);
  this.player.playlistUi();

  var items = this.fixture.querySelectorAll('.vjs-playlist-item');

  assert.strictEqual(items.length, 2, 'two items initially');

  this.player.playlist(playlist);
  this.player.trigger('playlistsorted');
  items = this.fixture.querySelectorAll('.vjs-playlist-item');
  assert.strictEqual(items.length, playlist.length, 'updated with the new items');
  assert.strictEqual(this.player.playlistMenu.items[0].item, playlist[0], 'we have updated items');
  assert.strictEqual(this.player.playlistMenu.items[1].item, playlist[1], 'we have updated items');
});

QUnit.test('updates on "playlistsorted", update selection', function (assert) {
  this.player.playlist(playlist);
  this.player.currentSrc = function () {
    return playlist[0].sources[0].src;
  };
  this.player.playlistUi();

  var items = this.fixture.querySelectorAll('.vjs-playlist-item');

  assert.strictEqual(items.length, 2, 'two items initially');

  assert.ok(/vjs-selected/.test(items[0].getAttribute('class')), 'first item is selected by default');
  this.player.playlist.currentItem(1);
  this.player.currentSrc = function () {
    return playlist[1].sources[0].src;
  };

  this.player.trigger('playlistsorted');
  items = this.fixture.querySelectorAll('.vjs-playlist-item');
  assert.strictEqual(items.length, playlist.length, 'updated with the new items');
  assert.ok(/vjs-selected/.test(items[1].getAttribute('class')), 'second item is selected after update');
  assert.ok(!/vjs-selected/.test(items[0].getAttribute('class')), 'first item is not selected after update');
});

QUnit.test('tracks when an ad is playing', function (assert) {
  this.player.playlist([]);
  this.player.playlistUi();

  this.player.duration = function () {
    return 5;
  };

  var playlistMenu = this.player.playlistMenu;

  assert.ok(!playlistMenu.hasClass('vjs-ad-playing'), 'does not have class vjs-ad-playing');
  this.player.trigger('adstart');
  assert.ok(playlistMenu.hasClass('vjs-ad-playing'), 'has class vjs-ad-playing');

  this.player.trigger('adend');
  assert.ok(!playlistMenu.hasClass('vjs-ad-playing'), 'does not have class vjs-ad-playing');
});

// -----------
// Interaction
// -----------

QUnit.test('changes the selection when tapped', function (assert) {
  var playCalled = false;

  this.player.playlist(playlist);
  this.player.playlistUi({ playOnSelect: true });
  this.player.play = function () {
    playCalled = true;
  };

  var sources = void 0;

  this.player.src = function (src) {
    if (src) {
      sources = src;
    }
    return sources[0];
  };
  this.player.currentSrc = function () {
    return sources[0].src;
  };
  this.player.playlistMenu.items[1].trigger('tap');
  // trigger a loadstart synchronously to simplify the test
  this.player.trigger('loadstart');

  assert.ok(this.player.playlistMenu.items[1].hasClass('vjs-selected'), 'selected the new item');
  assert.ok(!this.player.playlistMenu.items[0].hasClass('vjs-selected'), 'deselected the old item');
  assert.strictEqual(playCalled, true, 'play gets called if option is set');
});

QUnit.test('play should not get called by default upon selection of menu items ', function (assert) {
  var playCalled = false;

  this.player.playlist(playlist);
  this.player.playlistUi();
  this.player.play = function () {
    playCalled = true;
  };

  var sources = void 0;

  this.player.src = function (src) {
    if (src) {
      sources = src;
    }
    return sources[0];
  };
  this.player.currentSrc = function () {
    return sources[0].src;
  };
  this.player.playlistMenu.items[1].trigger('tap');
  // trigger a loadstart synchronously to simplify the test
  this.player.trigger('loadstart');
  assert.strictEqual(playCalled, false, 'play should not get called by default');
});

}(QUnit,videojs));
