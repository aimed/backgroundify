import {EditableCanvas} from './editable-canvas.js'
import {ImageChooser} from './image-chooser.js'
import imageStore from './image-store.js'

var canvas = new EditableCanvas(document.getElementById('canvas'))
var chooser = new ImageChooser(document.getElementById('input'))
var menu = document.getElementById('menu')
var background = document.getElementById('background')
var blurButton = document.getElementById('button-blur')
var brightnessButton = document.getElementById('button-brightness')
var saveButton = document.getElementById('button-save')
var loadingIndicators = document.getElementsByClassName('loading-indicator')

window.onresize = function () {
  resizeCanvas()
}

function toggleLoadingIndicators (val) {
  let className = 'hidden'
  for (let indicator of loadingIndicators) {
    val ? indicator.classList.remove(className) : indicator.classList.add(className)
  }
}

function setBackgroundImage (imageData) {
  background.style.background = 'url('+ imageData + ')'
}

blurButton.addEventListener('click', function () {
  canvas.blur(10)
})

brightnessButton.addEventListener('click', function () {
  canvas.adjustBrightness(10)
})

saveButton.addEventListener('click', function () {
  let data = canvas.getData()
  console.log(data);
  let imgageWindow = window.open(data, 'backgroundify_image')
})

// Listen for changes from the ImageChooser
chooser.addListener(function (err, file, chooser) {
  if (err) {
    return;
  }

  toggleLoadingIndicators(true)

  // allow changes to become visible
  setTimeout(async function () {
    // canvas.clear()

    // copy the image to close the file handler
    let uploaded = await EditableCanvas.asyncImage(URL.createObjectURL(file))

    // store copied image
    imageStore.setImage(uploaded)

    // cleanup
    URL.revokeObjectURL(uploaded.src)
    uploaded = null
  }, 0)
})

function canvasSizeForImage (image, canvas, paddingLR = 0, paddingTB = 0) {
  let maxHeight = window.innerHeight - paddingTB
  let maxWidth = window.innerWidth - paddingLR

  let srcHeight = image.naturalHeight
  let srcWidth = image.naturalWidth

  let ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  return { width: srcWidth*ratio, height: srcHeight*ratio };
}

function resizeCanvas () {
  let image = imageStore.getImage()
  let padding = menu.clientHeight * 2.2
  let canvasSize = canvasSizeForImage(image, canvas.canvas, padding, padding)

  canvas.canvas.style.width  = canvasSize.width + "px"
  canvas.canvas.style.height = canvasSize.height + "px"
}

// Listen for changes from the imageStore
imageStore.addListener(async function (event) {
  switch (event) {
    case 'IMAGE_STORE_IMAGE_CHANGED':
      let image = imageStore.getImage()
      let imageData = EditableCanvas.imageToDataURL(image)

      // set the background image
      resizeCanvas()
      setBackgroundImage(imageData)

      // draw on canvas
      await canvas.setImage(image)
      toggleLoadingIndicators(false)

      // store original image | (due to access restrictions we need to copy it first)
      // the original image is a copy. thus we won't have to copy twice
      setTimeout(function () {
        imageStore.storeImage(imageData)
      }, 0)
      break;
    default:
  }
})
