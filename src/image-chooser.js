export class ImageChooser {

  constructor (input) {
    this.listeners = []
    this.element = input || document.createElement('input')
    this.element.onchange = this.onChange.bind(this)
  }

  onChange (event) {
    var files = event.target.files
    var error = null
    var image = null

    if (files.length > 0) {
      var file = files[0]
      var isImage = file.type.match(/^image\/.*$/)
      if (!isImage) {
        error = 'INVALID_FILE_TYPE'
      } else {
        image = file
      }
    } else {
      error = 'NO_FILE_SELECTED'
    }

    // notify listeners
    for (let listener of this.listeners) {
      listener.call(listener, error, image, this)
    }
  }

  /**
   *
   */
  addListener (listener) {
    this.listeners.push(listener)
  }

  /**
   *
   */
  removeListener (listener) {
    this.listeners.remove(listener)
  }
}
