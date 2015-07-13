var STORAGE_KEY = {
  SESSION_IMG_SRC : 'SESSION_IMG_SRC'
}

var EVENTS = {
  IMAGE_CHANGED : 'IMAGE_STORE_IMAGE_CHANGED'
}

var storage = window.localStorage
var _image = null

var ImageStore = {
  /**
   *
   */
  setImage: function (image) {
    _image = image
    ImageStore.notifyListeners(EVENTS.IMAGE_CHANGED)
  },

  /**
   *
   */
  storeImage: function (imageData) {
    // store the image
    setTimeout(function () {
      try {
        storage.setItem(STORAGE_KEY.SESSION_IMG_SRC, imageData)
      } catch (e) {
        // can't store image
        console.log(e);
        storage.removeItem(STORAGE_KEY.SESSION_IMG_SRC)
      }
    }, 0)
  },

  /**
   *
   */
  getImage: function () {
    return _image
  },
  /**
   *
   */
  hasImage: function () {
    return !!_image
  },

  // ------ Listeners ------
  listeners: [],
  /**
   *
   */
  addListener: function (listener) {
    this.listeners.push(listener)
  },
  /**
   *
   */
  removeListener: function (listener) {
    this.listeners.remove(listener)
  },
  /**
   *
   */
  notifyListeners: function (event) {
    for (let listener of this.listeners) {
      listener.call(listener, event)
    }
  }
}

module.exports = ImageStore

// load image from storage
var storedImgData = storage.getItem(STORAGE_KEY.SESSION_IMG_SRC)
if (storedImgData) {
  var img = new Image()
  img.onload = function () {
    if (!ImageStore.hasImage()) {
      _image = img
      ImageStore.notifyListeners(EVENTS.IMAGE_CHANGED)
    }
  }
  img.src = storedImgData
}
