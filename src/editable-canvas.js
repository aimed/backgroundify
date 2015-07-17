import {stackBlurCanvasRGBA} from './StackBlur.js'

export class EditableCanvas {
  /**
   * Editable canvas
   * @param {Canvas} canvas Canvas to use for drawing
   */
  constructor(canvas) {
    if (canvas.prototype !== document.createElement('canvas').prototype) {
      throw new Error('canvas must be a canvas element')
    }
    this.canvas = canvas
    this.context = canvas.getContext('2d')
    this.original = null
  }

  /**
   * sets the image
   * @param {Image} image
   */
  async setImage (image) {
    // create a new image from the context -> "copy the image"
    // @NOTE might be inefficient, depending on the size of the image
    // also we might need to wait on the onload here
    this.original = await EditableCanvas.cloneImage(image)

    this.width = image.width
    this.height = image.height
    
    // draw the image on the canvas
    this.context.drawImage(this.original, 0, 0)

  }

  /**
   * copies the canvas to an image
   * @return {Image}
   */
  getImage (type) {
    var self = this
    return new Promise(function (resolve, reject) {
      var img = new Image()
      img.onload = resolve.bind(self, copy)
      img.src = self.getData(type)
    })
  }

  /**
   *
   */
  getData (type) {
    return this.canvas.toDataURL(type || 'image/png')
  }

  /**
   * restore the original image
   */
  restoreImage () {
    this.context.drawImage(this.original, 0, 0)
  }

  // ------ FILTERS ------

  /**
   * Blurs the canvas
   * @param {int} radius The blur radius
   */
  blur (radius) {
    stackBlurCanvasRGBA(this.canvas, 0, 0, this.width, this.height, radius)
  }

  /**
   * Adjusts the brightness
   * @param {int} value Amount
   * @param {bool} darkenOrLighten Will darken if true, brighten otherwise
   */
  adjustBrightness (value, darkenOrLighten) {
    this.context.fillStyle = 'rgba(0, 0, 0, 0.2)'
    this.context.fillRect(0, 0, this.width , this.height);
  }

  /**
   * Clears the canvas
   */
  clear () {
    this.original = null
    this.context.clearRect(0, 0, this.width, this.height)
  }

  // ------ Setter / Getter ------

  set width (width) {
    this.canvas.width = width
  }

  get width () {
    return this.canvas.width
  }

  set height (height) {
    this.canvas.height = height
  }

  get height () {
    return this.canvas.height
  }

  get data () {
    return this.context.getImageData(0, 0, this.width, this.height)
  }

  set data (data) {
    this.context.setImageData(data, 0, 0, this.width, this.height)
  }

  // https://github.com/kennethcachia/background-check/blob/master/background-check.js
  get dark () {
    let data = this.data.data
    let threashold = 50;
    var brightness;
    var pixels = 0;
    var delta;
    var mean = 0;
    var mask = {
      r: 0,
      g: 255,
      b: 0
    };

    for (var p = 0; p < data.length; p += 4) {
      pixels++;
      brightness = (0.2126 * data[p]) + (0.7152 * data[p + 1]) + (0.0722 * data[p + 2]);
      delta = brightness - mean;
      mean = mean + delta / pixels;
    }

    return (mean <= threashold / 100) ? true : false
  }

  get bright () {
    return !this.dark
  }

  // ------ Utils ------

  /**
   * Clones an image
   * @param {Image} image
   * @return {Promise}
   */
  static cloneImage (image, type) {
    let src = this.imageToDataURL(image, type)
    return this.asyncImage(src)
  }

  static asyncImage (src) {
    return new Promise(function (resolve, reject) {
      var copy = new Image()
      copy.onload = resolve.bind(this, copy)
      copy.src = src
    })
  }

  /**
   * Gets image Data
   */
  static imageToDataURL (image, type) {
    let canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height

    let context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)
    return canvas.toDataURL(type || 'image/png')
  }
}
